import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReceiptDto } from './dto';

@Injectable()
export class ReceiptsService {
  constructor(private prisma: PrismaService) {}

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
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

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
    const date = new Date(dto.date);
    date.setHours(0, 0, 0, 0);

    // 해당 날짜의 통계 계산
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

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
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);

    const receipt = await this.prisma.dailyReceipt.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });

    if (!receipt) {
      throw new NotFoundException('해당 날짜의 영수증이 없습니다');
    }

    await this.prisma.dailyReceipt.delete({
      where: {
        userId_date: { userId, date },
      },
    });
  }
}
