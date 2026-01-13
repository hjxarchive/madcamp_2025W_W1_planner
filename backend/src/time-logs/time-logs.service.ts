import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TimeLogsService {
  constructor(private prisma: PrismaService) {}

  async startTimer(userId: string, checklistId: string) {
    // 체크리스트 존재 및 권한 확인
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
      include: {
        project: { include: { members: true } },
      },
    });

    if (!checklist) {
      throw new NotFoundException('체크리스트를 찾을 수 없습니다');
    }

    const isMember = checklist.project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException(
        '프로젝트 멤버만 타이머를 시작할 수 있습니다',
      );
    }

    // 이미 진행 중인 타이머가 있는지 확인
    const activeTimer = await this.prisma.timeLog.findFirst({
      where: {
        userId,
        endedAt: null,
      },
    });

    if (activeTimer) {
      throw new BadRequestException('이미 진행 중인 타이머가 있습니다');
    }

    const timeLog = await this.prisma.timeLog.create({
      data: {
        checklistId,
        userId,
        startedAt: new Date(),
      },
    });

    return {
      id: timeLog.id,
      checklistId: timeLog.checklistId,
      userId: timeLog.userId,
      startedAt: timeLog.startedAt,
      endedAt: timeLog.endedAt,
    };
  }

  async stopTimer(userId: string, timeLogId: string) {
    const timeLog = await this.prisma.timeLog.findFirst({
      where: {
        id: timeLogId,
        userId,
        endedAt: null,
      },
    });

    if (!timeLog) {
      throw new NotFoundException('진행 중인 타이머를 찾을 수 없습니다');
    }

    const endedAt = new Date();
    const durationMinutes = Math.floor(
      (endedAt.getTime() - timeLog.startedAt.getTime()) / 60000,
    );

    const updated = await this.prisma.timeLog.update({
      where: { id: timeLogId },
      data: { endedAt },
    });

    return {
      id: updated.id,
      checklistId: updated.checklistId,
      userId: updated.userId,
      startedAt: updated.startedAt,
      endedAt: updated.endedAt,
      durationMinutes,
    };
  }

  async getActiveTimer(userId: string) {
    return this.prisma.timeLog.findFirst({
      where: {
        userId,
        endedAt: null,
      },
    });
  }

  async getTodaySummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 오늘의 타임 로그
    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startedAt: { gte: today, lt: tomorrow },
      },
      include: {
        checklist: {
          include: { project: true },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // 오늘 완료한 체크리스트
    const completedTasks = await this.prisma.checklist.findMany({
      where: {
        isCompleted: true,
        updatedAt: { gte: today, lt: tomorrow },
        project: {
          members: { some: { userId } },
        },
      },
      include: {
        project: true,
        timeLogs: { where: { userId } },
      },
    });

    // 프로젝트별 집계
    const projectMap = new Map<
      string,
      { minutes: number; completedTasksCount: number; title: string }
    >();

    timeLogs.forEach((log) => {
      if (!log.endedAt) return;
      const projectId = log.checklist.projectId;
      const duration = Math.floor(
        (log.endedAt.getTime() - log.startedAt.getTime()) / 60000,
      );

      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          minutes: 0,
          completedTasksCount: 0,
          title: log.checklist.project.title,
        });
      }
      projectMap.get(projectId)!.minutes += duration;
    });

    completedTasks.forEach((task) => {
      const projectId = task.projectId;
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          minutes: 0,
          completedTasksCount: 0,
          title: task.project.title,
        });
      }
      projectMap.get(projectId)!.completedTasksCount += 1;
    });

    // 초 단위 정밀도로 총 시간 계산
    const totalMs = timeLogs.reduce((sum, log) => {
      if (!log.endedAt) return sum;
      return sum + (log.endedAt.getTime() - log.startedAt.getTime());
    }, 0);
    const totalSeconds = Math.floor(totalMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);

    return {
      date: today.toISOString().split('T')[0],
      totalMinutes,
      totalSeconds, // 초 단위 정밀도
      completedTasksCount: completedTasks.length,
      projects: Array.from(projectMap.entries()).map(([projectId, data]) => ({
        projectId,
        projectTitle: data.title,
        minutes: data.minutes,
        completedTasksCount: data.completedTasksCount,
      })),
      timeLogs: timeLogs.map((log) => ({
        id: log.id,
        checklistId: log.checklistId,
        checklistContent: log.checklist.content,
        projectId: log.checklist.projectId,
        projectTitle: log.checklist.project.title,
        startedAt: log.startedAt,
        endedAt: log.endedAt,
        durationMinutes: log.endedAt
          ? Math.floor(
              (log.endedAt.getTime() - log.startedAt.getTime()) / 60000,
            )
          : null,
      })),
      completedTasks: completedTasks.map((task) => ({
        id: task.id,
        content: task.content,
        projectId: task.projectId,
        projectTitle: task.project.title,
        completedAt: task.updatedAt,
        totalTimeMinutes: task.timeLogs.reduce((sum, log) => {
          if (!log.endedAt) return sum;
          return (
            sum +
            Math.floor(
              (log.endedAt.getTime() - log.startedAt.getTime()) / 60000,
            )
          );
        }, 0),
      })),
    };
  }
}
