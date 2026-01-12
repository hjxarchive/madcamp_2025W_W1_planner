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
import { TimeLogsService } from '../time-logs/time-logs.service';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  TimerStartDto,
  TimerStopDto,
  RoomJoinDto,
  RoomLeaveDto,
  TimerStartedPayload,
  TimerStoppedPayload,
  TimerActivePayload,
  TimerTickPayload,
  TimerMemberStartedPayload,
  TimerMemberStoppedPayload,
  TimerErrorPayload,
} from './dto/timer.dto';

const DEV_FIREBASE_UID = 'dev-user-001';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  firebaseUid?: string;
}

@WebSocketGateway({
  namespace: '/timer',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // userId -> Socket[] (한 유저가 여러 기기에서 접속 가능)
  private userSockets: Map<string, AuthenticatedSocket[]> = new Map();

  // userId -> tick interval
  private tickIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly timeLogsService: TimeLogsService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth?.token ||
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
            console.warn('Firebase 인증 실패, 개발 모드로 임시 사용자 사용');
            firebaseUid = DEV_FIREBASE_UID;
          } else {
            client.emit('timer:error', {
              code: 'UNAUTHORIZED',
              message: '인증에 실패했습니다',
            } as TimerErrorPayload);
            client.disconnect();
            return;
          }
        }
      } else {
        client.emit('timer:error', {
          code: 'UNAUTHORIZED',
          message: '인증 토큰이 필요합니다',
        } as TimerErrorPayload);
        client.disconnect();
        return;
      }

      // Firebase UID로 사용자 조회
      const user = await this.usersService.findByFirebaseUid(firebaseUid);
      if (!user) {
        client.emit('timer:error', {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        } as TimerErrorPayload);
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

      console.log(`Client connected: ${client.id}, userId: ${user.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
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
          // 마지막 소켓이 disconnect되면 tick interval 정리
          this.clearTickInterval(client.userId);
        }
      }
      console.log(`Client disconnected: ${client.id}, userId: ${client.userId}`);
    }
  }

  @SubscribeMessage('timer:start')
  async handleTimerStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TimerStartDto,
  ) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    try {
      const result = await this.timeLogsService.startTimer(
        client.userId,
        data.checklistId,
      );

      // 체크리스트 및 프로젝트 정보 조회
      const checklist = await this.prisma.checklist.findUnique({
        where: { id: data.checklistId },
        include: {
          project: {
            include: { members: { include: { user: true } } },
          },
        },
      });

      if (!checklist) {
        return this.emitError(client, 'NOT_FOUND', '체크리스트를 찾을 수 없습니다');
      }

      const payload: TimerStartedPayload = {
        timeLog: {
          id: result.id,
          checklistId: result.checklistId,
          userId: result.userId,
          startedAt: result.startedAt,
        },
        checklist: {
          id: checklist.id,
          content: checklist.content,
        },
        project: {
          id: checklist.project.id,
          title: checklist.project.title,
        },
      };

      // 본인에게 알림 (모든 기기)
      this.server.to(`user:${client.userId}`).emit('timer:started', payload);

      // 프로젝트 멤버들에게 알림 (본인 제외)
      const user = await this.usersService.findById(client.userId);
      const memberPayload: TimerMemberStartedPayload = {
        userId: client.userId,
        userName: user.nickname,
        checklistContent: checklist.content,
        projectId: checklist.project.id,
      };

      client.to(`project:${checklist.project.id}`).emit('timer:member-started', memberPayload);

      // Tick interval 시작
      this.startTickInterval(client.userId, result.startedAt);

    } catch (error: any) {
      this.emitError(client, 'START_FAILED', error.message || '타이머 시작에 실패했습니다');
    }
  }

  @SubscribeMessage('timer:stop')
  async handleTimerStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TimerStopDto,
  ) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    try {
      // 먼저 타이머 정보 조회 (프로젝트 ID 필요)
      const timeLog = await this.prisma.timeLog.findUnique({
        where: { id: data.timeLogId },
        include: {
          checklist: {
            include: { project: true },
          },
        },
      });

      if (!timeLog) {
        return this.emitError(client, 'NOT_FOUND', '타이머를 찾을 수 없습니다');
      }

      const result = await this.timeLogsService.stopTimer(
        client.userId,
        data.timeLogId,
      );

      const payload: TimerStoppedPayload = {
        timeLog: {
          id: result.id,
          checklistId: result.checklistId,
          userId: result.userId,
          startedAt: result.startedAt,
          endedAt: result.endedAt!,
        },
        durationMinutes: result.durationMinutes,
      };

      // 본인에게 알림 (모든 기기)
      this.server.to(`user:${client.userId}`).emit('timer:stopped', payload);

      // 프로젝트 멤버들에게 알림 (본인 제외)
      const user = await this.usersService.findById(client.userId);
      const memberPayload: TimerMemberStoppedPayload = {
        userId: client.userId,
        userName: user.nickname,
        durationMinutes: result.durationMinutes,
        projectId: timeLog.checklist.project.id,
      };

      client.to(`project:${timeLog.checklist.project.id}`).emit('timer:member-stopped', memberPayload);

      // Tick interval 정지
      this.clearTickInterval(client.userId);

    } catch (error: any) {
      this.emitError(client, 'STOP_FAILED', error.message || '타이머 정지에 실패했습니다');
    }
  }

  @SubscribeMessage('timer:sync')
  async handleTimerSync(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    try {
      const activeTimer = await this.timeLogsService.getActiveTimer(client.userId);

      if (!activeTimer) {
        client.emit('timer:none', {});
        return;
      }

      const checklist = await this.prisma.checklist.findUnique({
        where: { id: activeTimer.checklistId },
        include: { project: true },
      });

      if (!checklist) {
        client.emit('timer:none', {});
        return;
      }

      const elapsedMs = Date.now() - activeTimer.startedAt.getTime();

      const payload: TimerActivePayload = {
        timeLog: {
          id: activeTimer.id,
          checklistId: activeTimer.checklistId,
          userId: activeTimer.userId,
          startedAt: activeTimer.startedAt,
        },
        checklist: {
          id: checklist.id,
          content: checklist.content,
        },
        project: {
          id: checklist.project.id,
          title: checklist.project.title,
        },
        elapsedMs,
      };

      client.emit('timer:active', payload);

      // Tick interval 시작 (이미 있으면 무시)
      if (!this.tickIntervals.has(client.userId)) {
        this.startTickInterval(client.userId, activeTimer.startedAt);
      }

    } catch (error: any) {
      this.emitError(client, 'SYNC_FAILED', error.message || '동기화에 실패했습니다');
    }
  }

  @SubscribeMessage('room:join')
  async handleRoomJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: RoomJoinDto,
  ) {
    if (!client.userId) {
      return this.emitError(client, 'UNAUTHORIZED', '인증이 필요합니다');
    }

    // 프로젝트 멤버인지 확인
    const member = await this.prisma.projectMember.findFirst({
      where: {
        projectId: data.projectId,
        userId: client.userId,
      },
    });

    if (!member) {
      return this.emitError(client, 'FORBIDDEN', '프로젝트 멤버만 참여할 수 있습니다');
    }

    client.join(`project:${data.projectId}`);
    console.log(`User ${client.userId} joined room project:${data.projectId}`);
  }

  @SubscribeMessage('room:leave')
  async handleRoomLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: RoomLeaveDto,
  ) {
    client.leave(`project:${data.projectId}`);
    console.log(`User ${client.userId} left room project:${data.projectId}`);
  }

  private emitError(client: Socket, code: string, message: string) {
    client.emit('timer:error', { code, message } as TimerErrorPayload);
  }

  private startTickInterval(userId: string, startedAt: Date) {
    // 이미 interval이 있으면 제거
    this.clearTickInterval(userId);

    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startedAt.getTime();
      const payload: TimerTickPayload = {
        elapsedMs,
        serverTime: new Date(),
      };
      this.server.to(`user:${userId}`).emit('timer:tick', payload);
    }, 30000); // 30초마다

    this.tickIntervals.set(userId, interval);
  }

  private clearTickInterval(userId: string) {
    const interval = this.tickIntervals.get(userId);
    if (interval) {
      clearInterval(interval);
      this.tickIntervals.delete(userId);
    }
  }
}
