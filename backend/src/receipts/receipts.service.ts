import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceiptImageService } from './receipt-image.service';
import { CreateReceiptDto } from './dto';

@Injectable()
export class ReceiptsService {
  private readonly logger = new Logger(ReceiptsService.name);

  constructor(
    private prisma: PrismaService,
    private receiptImageService: ReceiptImageService,
  ) {}

  /**
   * 날짜 문자열(YYYY-MM-DD)을 로컬 시간대로 파싱하여 시작/끝 시각 반환
   * new Date(dateStr)는 UTC로 파싱되어 시간대 문제가 발생할 수 있으므로 직접 파싱
   */
  private parseDateRange(dateStr: string): { date: Date; startOfDay: Date; endOfDay: Date } {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
    return { date, startOfDay, endOfDay };
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [receipts, total] = await Promise.all([
      this.prisma.dailyReceipt.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.dailyReceipt.count({ where: { userId } }),
    ]);

    return {
      data: receipts.map((r) => ({
        id: r.id,
        date: r.date.toISOString().split('T')[0],
        imageUrl: r.imageUrl,
        totalMinutes: r.totalMinutes,
        completedTasksCount: r.completedTasksCount,
        createdAt: r.createdAt,
      })),
      meta: { total, page, limit },
    };
  }

  async findByDate(userId: string, dateStr: string) {
    const { date } = this.parseDateRange(dateStr);

    const receipt = await this.prisma.dailyReceipt.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });

    if (!receipt) {
      throw new NotFoundException('해당 날짜의 영수증이 없습니다');
    }

    return {
      id: receipt.id,
      date: receipt.date.toISOString().split('T')[0],
      imageUrl: receipt.imageUrl,
      totalMinutes: receipt.totalMinutes,
      completedTasksCount: receipt.completedTasksCount,
      createdAt: receipt.createdAt,
    };
  }

  async createOrUpdate(userId: string, dto: CreateReceiptDto) {
    const { date, startOfDay, endOfDay } = this.parseDateRange(dto.date);

    // 총 시간 계산
    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startedAt: { gte: startOfDay, lte: endOfDay },
        endedAt: { not: null },
      },
    });

    const totalMinutes = timeLogs.reduce((sum, log) => {
      if (!log.endedAt) return sum;
      return (
        sum +
        Math.floor((log.endedAt.getTime() - log.startedAt.getTime()) / 60000)
      );
    }, 0);

    // 완료한 태스크 수 계산
    const completedTasksCount = await this.prisma.checklist.count({
      where: {
        isCompleted: true,
        updatedAt: { gte: startOfDay, lte: endOfDay },
        project: {
          members: { some: { userId } },
        },
      },
    });

    const receipt = await this.prisma.dailyReceipt.upsert({
      where: {
        userId_date: { userId, date },
      },
      update: {
        imageUrl: dto.imageUrl,
        totalMinutes,
        completedTasksCount,
      },
      create: {
        userId,
        date,
        imageUrl: dto.imageUrl,
        totalMinutes,
        completedTasksCount,
      },
    });

    return {
      id: receipt.id,
      date: receipt.date.toISOString().split('T')[0],
      imageUrl: receipt.imageUrl,
      totalMinutes: receipt.totalMinutes,
      completedTasksCount: receipt.completedTasksCount,
      createdAt: receipt.createdAt,
    };
  }

  async delete(userId: string, dateStr: string) {
    const { date } = this.parseDateRange(dateStr);

    const receipt = await this.prisma.dailyReceipt.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });

    if (!receipt) {
      throw new NotFoundException('해당 날짜의 영수증이 없습니다');
    }

    // 기존 이미지 파일 삭제
    if (receipt.imageUrl) {
      const filename = receipt.imageUrl.split('/').pop();
      if (filename) {
        await this.receiptImageService.deleteImage(filename);
      }
    }

    await this.prisma.dailyReceipt.delete({
      where: {
        userId_date: { userId, date },
      },
    });
  }

  /**
   * 영수증 이미지 생성 및 저장
   */
  async generateImage(userId: string, dateStr: string): Promise<{
    id: string;
    date: string;
    imageUrl: string;
    totalMinutes: number;
    completedTasksCount: number;
  }> {
    this.logger.log(`[generateImage] 시작: userId=${userId}, dateStr=${dateStr}`);

    try {
      const { date, startOfDay, endOfDay } = this.parseDateRange(dateStr);
      this.logger.log(`[generateImage] 날짜 파싱 완료: date=${date.toISOString()}, startOfDay=${startOfDay.toISOString()}, endOfDay=${endOfDay.toISOString()}`);

      // 사용자 정보 조회
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      this.logger.log(`[generateImage] 사용자 조회 완료: ${user?.nickname || 'NOT FOUND'}`);

      if (!user) {
        throw new NotFoundException('사용자를 찾을 수 없습니다');
      }

    // TimeLog와 연결된 Checklist, Project 정보 함께 조회
    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startedAt: { gte: startOfDay, lte: endOfDay },
        endedAt: { not: null },
      },
      include: {
        checklist: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Task별 시간 집계
    const taskMap = new Map<
      string,
      { taskName: string; projectName: string; durationMs: number }
    >();

    timeLogs.forEach((log) => {
      if (!log.endedAt) return;
      const key = `${log.checklist.id}`;
      const durationMs = log.endedAt.getTime() - log.startedAt.getTime();

      if (taskMap.has(key)) {
        const existing = taskMap.get(key)!;
        existing.durationMs += durationMs;
      } else {
        taskMap.set(key, {
          taskName: log.checklist.content,
          projectName: log.checklist.project.title,
          durationMs,
        });
      }
    });

    const tasks = Array.from(taskMap.values());
    const totalTimeMs = tasks.reduce((sum, t) => sum + t.durationMs, 0);
    const totalMinutes = Math.floor(totalTimeMs / 60000);

    // 144 슬롯 (10분 단위) 타임라인 생성
    const timeSlots: boolean[] = new Array(144).fill(false);
    timeLogs.forEach((log) => {
      if (!log.endedAt) return;
      const startSlot = Math.floor(
        (log.startedAt.getHours() * 60 + log.startedAt.getMinutes()) / 10,
      );
      const endSlot = Math.floor(
        (log.endedAt.getHours() * 60 + log.endedAt.getMinutes()) / 10,
      );
      for (let i = startSlot; i <= endSlot && i < 144; i++) {
        timeSlots[i] = true;
      }
    });

    // 영수증 레코드 생성 또는 업데이트
    let receipt = await this.prisma.dailyReceipt.findUnique({
      where: { userId_date: { userId, date } },
    });

    if (!receipt) {
      receipt = await this.prisma.dailyReceipt.create({
        data: {
          userId,
          date,
          totalMinutes,
          completedTasksCount: tasks.length,
        },
      });
    }

    // 기존 이미지 삭제
    if (receipt.imageUrl) {
      const oldFilename = receipt.imageUrl.split('/').pop();
      if (oldFilename) {
        await this.receiptImageService.deleteImage(oldFilename);
      }
    }

    // 새 이미지 생성
    const filename = await this.receiptImageService.generateReceiptImage(
      receipt.id,
      {
        nickname: user.nickname,
        date,
        recordedAt: new Date(),
        tasks,
        totalTimeMs,
        timeSlots,
      },
    );

    // 이미지 URL 업데이트
    const imageUrl = `/uploads/receipts/${filename}`;
    const updatedReceipt = await this.prisma.dailyReceipt.update({
      where: { id: receipt.id },
      data: {
        imageUrl,
        totalMinutes,
        completedTasksCount: tasks.length,
      },
    });

    this.logger.log(
      `영수증 이미지 생성 완료: userId=${userId}, date=${dateStr}`,
    );

    return {
      id: updatedReceipt.id,
      date: updatedReceipt.date.toISOString().split('T')[0],
      imageUrl: updatedReceipt.imageUrl!,
      totalMinutes: updatedReceipt.totalMinutes,
      completedTasksCount: updatedReceipt.completedTasksCount,
    };
    } catch (error) {
      this.logger.error(`[generateImage] 에러 발생: ${error.message}`);
      this.logger.error(`[generateImage] 스택 트레이스:`, error.stack);
      throw error;
    }
  }

  /**
   * 영수증 상세 정보 조회 (이미지 생성용 데이터 포함)
   */
  async getReceiptDetails(userId: string, dateStr: string) {
    const { date, startOfDay, endOfDay } = this.parseDateRange(dateStr);

    // TimeLog 조회
    const timeLogs = await this.prisma.timeLog.findMany({
      where: {
        userId,
        startedAt: { gte: startOfDay, lte: endOfDay },
        endedAt: { not: null },
      },
      include: {
        checklist: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    // Task별 시간 집계
    const taskMap = new Map<
      string,
      { taskName: string; projectName: string; durationMs: number }
    >();

    timeLogs.forEach((log) => {
      if (!log.endedAt) return;
      const key = `${log.checklist.id}`;
      const durationMs = log.endedAt.getTime() - log.startedAt.getTime();

      if (taskMap.has(key)) {
        const existing = taskMap.get(key)!;
        existing.durationMs += durationMs;
      } else {
        taskMap.set(key, {
          taskName: log.checklist.content,
          projectName: log.checklist.project.title,
          durationMs,
        });
      }
    });

    const tasks = Array.from(taskMap.values());
    const totalTimeMs = tasks.reduce((sum, t) => sum + t.durationMs, 0);

    // 144 슬롯 (10분 단위) 타임라인 생성
    const timeSlots: boolean[] = new Array(144).fill(false);
    timeLogs.forEach((log) => {
      if (!log.endedAt) return;
      const startSlot = Math.floor(
        (log.startedAt.getHours() * 60 + log.startedAt.getMinutes()) / 10,
      );
      const endSlot = Math.floor(
        (log.endedAt.getHours() * 60 + log.endedAt.getMinutes()) / 10,
      );
      for (let i = startSlot; i <= endSlot && i < 144; i++) {
        timeSlots[i] = true;
      }
    });

    // 기존 영수증 정보 조회
    const receipt = await this.prisma.dailyReceipt.findUnique({
      where: { userId_date: { userId, date } },
    });

    return {
      id: receipt?.id,
      date: dateStr,
      imageUrl: receipt?.imageUrl,
      tasks,
      totalTimeMs,
      totalMinutes: Math.floor(totalTimeMs / 60000),
      completedTasksCount: tasks.length,
      timeSlots,
      createdAt: receipt?.createdAt,
    };
  }
}
