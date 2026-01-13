import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudySessionsService {
  constructor(private prisma: PrismaService) {}

  async join(userId: string, locationId: string) {
    // 장소 확인
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      throw new NotFoundException('장소를 찾을 수 없습니다');
    }

    // 이미 활성 세션이 있는지 확인
    const activeSession = await this.prisma.studySession.findFirst({
      where: {
        userId,
        leftAt: null,
      },
    });

    if (activeSession) {
      throw new BadRequestException('이미 참가 중인 스터디 세션이 있습니다');
    }

    const session = await this.prisma.studySession.create({
      data: {
        userId,
        locationId,
        joinedAt: new Date(),
      },
    });

    return {
      id: session.id,
      userId: session.userId,
      locationId: session.locationId,
      joinedAt: session.joinedAt,
      leftAt: session.leftAt,
    };
  }

  async leave(userId: string, sessionId: string) {
    const session = await this.prisma.studySession.findFirst({
      where: {
        id: sessionId,
        userId,
        leftAt: null,
      },
    });

    if (!session) {
      throw new NotFoundException('활성 스터디 세션을 찾을 수 없습니다');
    }

    const updated = await this.prisma.studySession.update({
      where: { id: sessionId },
      data: { leftAt: new Date() },
    });

    return {
      id: updated.id,
      userId: updated.userId,
      locationId: updated.locationId,
      joinedAt: updated.joinedAt,
      leftAt: updated.leftAt,
    };
  }
}
