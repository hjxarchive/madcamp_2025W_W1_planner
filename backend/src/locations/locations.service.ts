import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto';

// 시드 데이터: 기본 스터디 장소들
const SEED_LOCATIONS = ['공부방1', '공부방2', '도서관', '카페'];

@Injectable()
export class LocationsService implements OnModuleInit {
  private readonly logger = new Logger(LocationsService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // 앱 시작 시 시드 데이터 확인 및 생성
    await this.seedLocations();
  }

  private async seedLocations() {
    const existingLocations = await this.prisma.location.findMany();

    if (existingLocations.length === 0) {
      this.logger.log('시드 데이터 생성 중: 기본 스터디 장소들');

      for (const name of SEED_LOCATIONS) {
        await this.prisma.location.create({
          data: { name },
        });
      }

      this.logger.log(`${SEED_LOCATIONS.length}개의 기본 장소가 생성되었습니다.`);
    }
  }

  async findAll() {
    const locations = await this.prisma.location.findMany({
      orderBy: { name: 'asc' },
    });

    return {
      data: locations.map((loc) => ({
        id: loc.id,
        name: loc.name,
      })),
    };
  }

  async create(dto: CreateLocationDto) {
    const location = await this.prisma.location.create({
      data: {
        name: dto.name,
      },
    });

    return {
      id: location.id,
      name: location.name,
    };
  }

  async getParticipants(locationId: string) {
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });

    if (!location) {
      return { location: null, participants: [] };
    }

    // 현재 활성 세션의 참가자들
    const activeSessions = await this.prisma.studySession.findMany({
      where: {
        locationId,
        leftAt: null,
      },
      include: {
        user: true,
      },
      orderBy: { joinedAt: 'asc' },
    });

    // 각 참가자의 오늘 총 시간과 현재 프로젝트 계산
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const participantsWithStats = await Promise.all(
      activeSessions.map(async (session) => {
        // 오늘의 타임 로그 합계
        const timeLogs = await this.prisma.timeLog.findMany({
          where: {
            userId: session.userId,
            startedAt: { gte: today, lt: tomorrow },
            endedAt: { not: null },
          },
        });

        const todayTotalMinutes = timeLogs.reduce((sum, log) => {
          if (!log.endedAt) return sum;
          return (
            sum +
            Math.floor(
              (log.endedAt.getTime() - log.startedAt.getTime()) / 60000,
            )
          );
        }, 0);

        // 현재 진행 중인 타이머가 있다면 해당 프로젝트
        const activeTimer = await this.prisma.timeLog.findFirst({
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

        return {
          userId: session.userId,
          nickname: session.user.nickname,
          profileEmoji: session.user.profileEmoji,
          currentProject: activeTimer?.checklist.project.title ?? null,
          todayTotalMinutes,
          joinedAt: session.joinedAt,
        };
      }),
    );

    return {
      location: {
        id: location.id,
        name: location.name,
      },
      participants: participantsWithStats,
    };
  }
}
