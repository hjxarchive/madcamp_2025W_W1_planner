import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { Logger } from '@nestjs/common';

const DEV_FIREBASE_UID = 'dev-user-001';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  firebaseUid?: string;
}

interface StudyJoinDto {
  locationId: string;
}

interface StudyLeaveDto {
  locationId: string;
}

export interface ParticipantInfo {
  sessionId: string;
  userId: string;
  nickname: string;
  profileEmoji: string | null;
  todayTotalMinutes: number;
  joinedAt: Date;
  currentProject: string | null;
}

export interface ParticipantsUpdatedPayload {
  locationId: string;
  participants: ParticipantInfo[];
}

@WebSocketGateway({
  namespace: '/study',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class StudyGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StudyGateway.name);

  // userId -> Socket[] (한 유저가 여러 기기에서 접속 가능)
  private userSockets: Map<string, AuthenticatedSocket[]> = new Map();

  // userId -> locationId (현재 참가 중인 위치)
  private userLocations: Map<string, string> = new Map();

  constructor(
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      const isDev = process.env.NODE_ENV !== 'production';
      let firebaseUid: string;

      if (isDev && (!token || token === 'dev-token')) {
        firebaseUid = DEV_FIREBASE_UID;
      } else if (token) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          firebaseUid = decodedToken.uid;
        } catch (error) {
          if (isDev) {
            this.logger.warn('Firebase 인증 실패, 개발 모드로 임시 사용자 사용');
            firebaseUid = DEV_FIREBASE_UID;
          } else {
            client.emit('study:error', {
              code: 'UNAUTHORIZED',
              message: '인증에 실패했습니다',
            });
            client.disconnect();
            return;
          }
        }
      } else {
        client.emit('study:error', {
          code: 'UNAUTHORIZED',
          message: '인증 토큰이 필요합니다',
        });
        client.disconnect();
        return;
      }

      // Firebase UID로 사용자 조회
      const user = await this.usersService.findByFirebaseUid(firebaseUid);
      if (!user) {
        client.emit('study:error', {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        });
        client.disconnect();
        return;
      }

      client.userId = user.id;
      client.firebaseUid = firebaseUid;

      // 사용자별 소켓 저장
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, []);
      }
      this.userSockets.get(user.id)!.push(client);

      // 사용자 개인 룸에 조인
      client.join(`user:${user.id}`);

      this.logger.log(`Study client connected: ${client.id}, userId: ${user.id}`);
    } catch (error) {
      this.logger.error('Study connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      // 소켓 목록에서 제거
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        const index = sockets.indexOf(client);
        if (index > -1) {
          sockets.splice(index, 1);
        }
        if (sockets.length === 0) {
          this.userSockets.delete(client.userId);

          // 마지막 소켓이 disconnect되면 자동으로 위치에서 퇴장
          const locationId = this.userLocations.get(client.userId);
          if (locationId) {
            await this.leaveLocation(client.userId, locationId);
          }
        }
      }
      this.logger.log(`Study client disconnected: ${client.id}, userId: ${client.userId}`);
    }
  }

  @SubscribeMessage('study:join')
  async handleStudyJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: StudyJoinDto,
  ) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    try {
      const { locationId } = data;

      // 위치 존재 확인
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });

      if (!location) {
        return this.emitError(client, 'NOT_FOUND', '해당 위치를 찾을 수 없습니다');
      }

      // 이전 위치에서 퇴장
      const previousLocationId = this.userLocations.get(client.userId);
      if (previousLocationId && previousLocationId !== locationId) {
        await this.leaveLocation(client.userId, previousLocationId);
        client.leave(`location:${previousLocationId}`);
      }

      // 기존 활성 세션 종료
      await this.prisma.studySession.updateMany({
        where: {
          userId: client.userId,
          leftAt: null,
        },
        data: {
          leftAt: new Date(),
        },
      });

      // 새 세션 생성
      await this.prisma.studySession.create({
        data: {
          userId: client.userId,
          locationId,
          socketId: client.id,
        },
      });

      // 위치 룸에 조인
      client.join(`location:${locationId}`);
      this.userLocations.set(client.userId, locationId);

      this.logger.log(`User ${client.userId} joined location ${locationId}`);

      // 해당 위치의 모든 참가자에게 업데이트 브로드캐스트
      await this.broadcastParticipants(locationId);

      // 본인에게도 현재 참가자 목록 전송
      client.emit('study:joined', { locationId });
    } catch (error: any) {
      this.logger.error('Study join error:', error);
      this.emitError(client, 'JOIN_FAILED', error.message || '참가에 실패했습니다');
    }
  }

  @SubscribeMessage('study:leave')
  async handleStudyLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: StudyLeaveDto,
  ) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    try {
      const { locationId } = data;

      await this.leaveLocation(client.userId, locationId);
      client.leave(`location:${locationId}`);

      client.emit('study:left', { locationId });
    } catch (error: any) {
      this.logger.error('Study leave error:', error);
      this.emitError(client, 'LEAVE_FAILED', error.message || '퇴장에 실패했습니다');
    }
  }

  @SubscribeMessage('study:sync')
  async handleStudySync(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    try {
      // 현재 참가 중인 위치 확인
      const activeSession = await this.prisma.studySession.findFirst({
        where: {
          userId: client.userId,
          leftAt: null,
        },
        include: { location: true },
      });

      if (activeSession) {
        // 위치 룸에 재조인
        client.join(`location:${activeSession.locationId}`);
        this.userLocations.set(client.userId, activeSession.locationId);

        // 참가자 목록 전송
        const participants = await this.getLocationParticipants(activeSession.locationId);
        client.emit('study:synced', {
          locationId: activeSession.locationId,
          locationName: activeSession.location.name,
          participants,
        });
      } else {
        client.emit('study:synced', { locationId: null, participants: [] });
      }
    } catch (error: any) {
      this.logger.error('Study sync error:', error);
      this.emitError(client, 'SYNC_FAILED', error.message || '동기화에 실패했습니다');
    }
  }

  private async leaveLocation(userId: string, locationId: string) {
    // 세션 종료
    await this.prisma.studySession.updateMany({
      where: {
        userId,
        locationId,
        leftAt: null,
      },
      data: {
        leftAt: new Date(),
      },
    });

    this.userLocations.delete(userId);

    // 해당 위치의 참가자들에게 업데이트 브로드캐스트
    await this.broadcastParticipants(locationId);
  }

  private async getLocationParticipants(locationId: string): Promise<ParticipantInfo[]> {
    // 활성 세션 조회
    const sessions = await this.prisma.studySession.findMany({
      where: {
        locationId,
        leftAt: null,
      },
      include: {
        user: true,
      },
      orderBy: { joinedAt: 'asc' },
    });

    // 오늘의 시작/끝
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const participants: ParticipantInfo[] = [];

    for (const session of sessions) {
      // 오늘의 총 시간 계산
      const timeLogs = await this.prisma.timeLog.findMany({
        where: {
          userId: session.userId,
          startedAt: { gte: startOfDay, lte: endOfDay },
          endedAt: { not: null },
        },
      });

      const todayTotalMinutes = timeLogs.reduce((sum, log) => {
        if (!log.endedAt) return sum;
        return sum + Math.floor((log.endedAt.getTime() - log.startedAt.getTime()) / 60000);
      }, 0);

      // 현재 진행 중인 프로젝트
      const activeTimeLog = await this.prisma.timeLog.findFirst({
        where: {
          userId: session.userId,
          endedAt: null,
        },
        include: {
          checklist: {
            include: { project: true },
          },
        },
      });

      participants.push({
        sessionId: session.id,
        userId: session.userId,
        nickname: session.user.nickname,
        profileEmoji: session.user.profileEmoji,
        todayTotalMinutes,
        joinedAt: session.joinedAt,
        currentProject: activeTimeLog?.checklist?.project?.title || null,
      });
    }

    return participants;
  }

  private async broadcastParticipants(locationId: string) {
    const participants = await this.getLocationParticipants(locationId);

    const payload: ParticipantsUpdatedPayload = {
      locationId,
      participants,
    };

    this.server.to(`location:${locationId}`).emit('study:participants-updated', payload);
  }

  private emitError(client: Socket, code: string, message: string) {
    client.emit('study:error', { code, message });
  }
}
