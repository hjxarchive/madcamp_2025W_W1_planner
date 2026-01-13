import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { ReceiptsService } from './receipts.service';

@Injectable()
export class ReceiptSchedulerService {
  private readonly logger = new Logger(ReceiptSchedulerService.name);

  constructor(
    private prisma: PrismaService,
    private receiptsService: ReceiptsService,
  ) {}

  /**
   * 매일 00:05에 전날의 영수증 이미지를 자동 생성
   * Cron: 분(5) 시(0) 일(*) 월(*) 요일(*)
   */
  @Cron('5 0 * * *', {
    name: 'generateDailyReceipts',
    timeZone: 'Asia/Seoul',
  })
  async handleDailyReceiptGeneration() {
    this.logger.log('=== 일일 영수증 자동 생성 시작 ===');

    try {
      // 전날 날짜 계산
      const yesterday = this.getYesterdayDateString();
      this.logger.log(`대상 날짜: ${yesterday}`);

      // 전날 활동이 있는 사용자 조회
      const usersWithActivity = await this.getUsersWithActivityOnDate(yesterday);

      if (usersWithActivity.length === 0) {
        this.logger.log('전날 활동이 있는 사용자가 없습니다.');
        return;
      }

      this.logger.log(`영수증 생성 대상 사용자 수: ${usersWithActivity.length}`);

      // 각 사용자별로 영수증 이미지 생성
      let successCount = 0;
      let failCount = 0;

      for (const user of usersWithActivity) {
        try {
          this.logger.log(`영수증 생성 시작: userId=${user.id}, nickname=${user.nickname}`);

          await this.receiptsService.generateImage(user.id, yesterday);

          successCount++;
          this.logger.log(`영수증 생성 완료: userId=${user.id}`);
        } catch (error) {
          failCount++;
          this.logger.error(
            `영수증 생성 실패: userId=${user.id}, error=${error.message}`,
          );
        }

        // 서버 부하 방지를 위해 약간의 딜레이 추가
        await this.delay(500);
      }

      this.logger.log(
        `=== 일일 영수증 자동 생성 완료 === 성공: ${successCount}, 실패: ${failCount}`,
      );
    } catch (error) {
      this.logger.error(`일일 영수증 자동 생성 중 오류 발생: ${error.message}`);
      this.logger.error(error.stack);
    }
  }

  /**
   * 전날 날짜 문자열 반환 (YYYY-MM-DD)
   */
  private getYesterdayDateString(): string {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  /**
   * 특정 날짜에 TimeLog가 있는 사용자 목록 조회
   */
  private async getUsersWithActivityOnDate(
    dateStr: string,
  ): Promise<{ id: string; nickname: string }[]> {
    // 날짜 범위 계산
    const [year, month, day] = dateStr.split('-').map(Number);
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    // 해당 날짜에 완료된 TimeLog가 있는 사용자 조회
    const usersWithTimeLogs = await this.prisma.timeLog.findMany({
      where: {
        startedAt: { gte: startOfDay, lte: endOfDay },
        endedAt: { not: null },
      },
      select: {
        userId: true,
      },
      distinct: ['userId'],
    });

    if (usersWithTimeLogs.length === 0) {
      return [];
    }

    // 사용자 정보 조회
    const userIds = usersWithTimeLogs.map((log) => log.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nickname: true },
    });

    return users;
  }

  /**
   * 딜레이 유틸리티
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 수동 실행용 메서드 (테스트/디버깅용)
   * 특정 날짜의 모든 사용자 영수증을 생성
   */
  async generateReceiptsForDate(dateStr: string): Promise<{
    date: string;
    totalUsers: number;
    success: number;
    failed: number;
  }> {
    this.logger.log(`[수동 실행] 날짜 ${dateStr}의 영수증 생성 시작`);

    const usersWithActivity = await this.getUsersWithActivityOnDate(dateStr);

    if (usersWithActivity.length === 0) {
      return { date: dateStr, totalUsers: 0, success: 0, failed: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    for (const user of usersWithActivity) {
      try {
        await this.receiptsService.generateImage(user.id, dateStr);
        successCount++;
      } catch (error) {
        failCount++;
        this.logger.error(
          `[수동 실행] 영수증 생성 실패: userId=${user.id}, error=${error.message}`,
        );
      }
      await this.delay(500);
    }

    this.logger.log(
      `[수동 실행] 완료: 성공=${successCount}, 실패=${failCount}`,
    );

    return {
      date: dateStr,
      totalUsers: usersWithActivity.length,
      success: successCount,
      failed: failCount,
    };
  }
}
