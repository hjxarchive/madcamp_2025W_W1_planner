import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

interface ReceiptTask {
  taskName: string;
  projectName: string;
  durationMs: number;
}

interface ReceiptData {
  nickname: string;
  date: Date;
  recordedAt?: Date;
  tasks: ReceiptTask[];
  totalTimeMs: number;
  timeSlots: boolean[]; // 144 slots (10분 단위) or 24 slots (1시간 단위)
}

@Injectable()
export class ReceiptImageService {
  private readonly logger = new Logger(ReceiptImageService.name);
  private readonly uploadDir = path.join(process.cwd(), 'uploads', 'receipts');

  constructor() {
    // 업로드 디렉토리 확인 및 생성
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 영수증 이미지 생성
   */
  async generateReceiptImage(
    receiptId: string,
    data: ReceiptData,
  ): Promise<string> {
    const html = this.generateReceiptHTML(data);
    const filename = `receipt_${receiptId}_${Date.now()}.png`;
    const filepath = path.join(this.uploadDir, filename);

    let browser: puppeteer.Browser | null = null;

    try {
      this.logger.log(`영수증 이미지 생성 시작: receiptId=${receiptId}`);
      this.logger.log(`업로드 디렉토리: ${this.uploadDir}`);
      this.logger.log(`파일 경로: ${filepath}`);

      // Chromium 실행 경로 확인
      const chromiumPath = '/usr/bin/chromium-browser';
      this.logger.log(`Chromium 경로: ${chromiumPath}`);

      browser = await puppeteer.launch({
        headless: true,
        executablePath: chromiumPath,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      });
      this.logger.log('Puppeteer 브라우저 실행 성공');

      const page = await browser.newPage();
      await page.setViewport({ width: 400, height: 900, deviceScaleFactor: 2 });
      await page.setContent(html, { waitUntil: 'networkidle0' });

      // 실제 컨텐츠 높이 계산
      const bodyHeight = await page.evaluate(() => {
        const body = document.body;
        return body.scrollHeight;
      });

      await page.setViewport({
        width: 400,
        height: bodyHeight + 40,
        deviceScaleFactor: 2,
      });

      await page.screenshot({
        path: filepath,
        type: 'png',
        omitBackground: false,
      });

      this.logger.log(`영수증 이미지 생성 완료: ${filename}`);
      return filename;
    } catch (error) {
      this.logger.error('영수증 이미지 생성 실패:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * 기존 이미지 파일 삭제
   */
  async deleteImage(filename: string): Promise<void> {
    const filepath = path.join(this.uploadDir, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      this.logger.log(`이미지 삭제: ${filename}`);
    }
  }

  /**
   * 시간 포맷팅 (HH:MM:SS)
   */
  private formatTime(ms: number): string {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  /**
   * 날짜 포맷팅 (YYYY.MM.DD.)
   */
  private formatDate(date: Date): string {
    return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}.`;
  }

  /**
   * 날짜 포맷팅 (YYYY-MM-DD)
   */
  private formatDateFull(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * 요일 반환
   */
  private getDayName(date: Date): string {
    return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  }

  /**
   * MomentoApp.jsx 스타일의 HTML 템플릿 생성
   */
  private generateReceiptHTML(data: ReceiptData): string {
    const { nickname, date, recordedAt, tasks, totalTimeMs, timeSlots } = data;

    // 바코드 코드 생성
    const barcodeCode = `${this.formatDateFull(date).replace(/-/g, '')}${String(tasks.length).padStart(4, '0')}`;

    // 기록 일시
    const recordedTimeStr = recordedAt
      ? `${this.formatDateFull(date)} ${String(recordedAt.getHours()).padStart(2, '0')}:${String(recordedAt.getMinutes()).padStart(2, '0')}:${String(recordedAt.getSeconds()).padStart(2, '0')}`
      : `${this.formatDateFull(date)} 23:59:59`;

    // Task 목록 HTML
    const tasksHTML =
      tasks.length > 0
        ? tasks
            .map(
              (t) => `
          <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0;">
            <span style="flex: 1; color: #1f2937; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 8px;">${t.taskName}</span>
            <span style="width: 60px; text-align: center; color: #4b5563; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.projectName}</span>
            <span style="width: 80px; text-align: right; font-family: monospace; color: #111827;">${this.formatTime(t.durationMs)}</span>
          </div>
        `,
            )
            .join('')
        : `<div style="padding: 16px 0; text-align: center; color: #9ca3af; font-size: 14px;">기록된 Task가 없습니다</div>`;

    // 바코드 타임라인 (144 슬롯 또는 24 슬롯 지원)
    const slotsCount = timeSlots.length;
    const slotWidth = slotsCount === 144 ? 2 : 10;
    const barcodeHTML = timeSlots
      .map(
        (active, i) => `
        <div style="flex: 1; min-width: ${slotWidth}px; height: ${active ? '100%' : '8px'}; background-color: ${active ? '#000' : '#fff'}; border-radius: 1px;"></div>
      `,
      )
      .join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #f3f4f6;
      padding: 20px;
    }
    .receipt {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      max-width: 360px;
      margin: 0 auto;
      font-family: monospace;
    }
    .dashed-line {
      border-top: 1px dashed #d1d5db;
      margin: 12px 0;
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- 로고 -->
    <div style="display: flex; justify-content: center; padding-top: 24px; padding-bottom: 8px;">
      <div style="width: 48px; height: 48px; background-color: #111827; border-radius: 12px; display: flex; align-items: center; justify-content: center; transform: rotate(12deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(-12deg);">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
    </div>

    <!-- 제목 -->
    <div style="text-align: center; padding: 0 24px 16px 24px;">
      <h2 style="font-size: 20px; font-weight: bold; color: #111827;">${nickname}'s Momento</h2>
      <p style="font-size: 14px; color: #6b7280; margin-top: 4px;">${this.formatDate(date)} (${this.getDayName(date)})</p>
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- 기록 일시 -->
    <div style="padding: 8px 24px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <span style="color: #4b5563;">기록 일시</span>
        <span style="color: #111827;">${recordedTimeStr}</span>
      </div>
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- Task 내역 헤더 -->
    <div style="padding: 8px 24px;">
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; font-weight: 600;">
        <span style="flex: 1;">Task명</span>
        <span style="width: 60px; text-align: center;">프로젝트</span>
        <span style="width: 80px; text-align: right;">소요시간</span>
      </div>
    </div>

    <div style="border-top: 1px dashed #d1d5db; margin: 0 16px;"></div>

    <!-- Task 목록 -->
    <div style="padding: 8px 24px;">
      ${tasksHTML}
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- 합계 -->
    <div style="padding: 8px 24px;">
      <div style="display: flex; justify-content: space-between; font-size: 14px;">
        <span style="color: #4b5563;">합계</span>
        <span style="font-family: monospace; font-weight: bold; color: #111827;">${this.formatTime(totalTimeMs)}</span>
      </div>
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- 상세 내역 -->
    <div style="padding: 8px 24px;">
      <p style="font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 8px;">[상세 내역]</p>
      <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0;">
        <span style="color: #4b5563;">완료 Task</span>
        <span style="color: #111827;">${tasks.length}개</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0;">
        <span style="color: #4b5563;">평균 소요시간</span>
        <span style="font-family: monospace; color: #111827;">${this.formatTime(Math.floor(totalTimeMs / Math.max(tasks.length, 1)))}</span>
      </div>
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- 총 소요시간 -->
    <div style="padding: 12px 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: bold; color: #111827;">총 소요시간</span>
        <span style="font-size: 24px; font-family: monospace; font-weight: bold; color: #111827;">${this.formatTime(totalTimeMs)}</span>
      </div>
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- 바코드 타임라인 -->
    <div style="padding: 16px 24px;">
      <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-align: center;">[24시간 타임라인]</p>
      <div style="display: flex; gap: 1px; height: 48px; align-items: flex-end; padding: 0 16px;">
        ${barcodeHTML}
      </div>
      <p style="font-family: monospace; font-size: 12px; color: #4b5563; margin-top: 8px; text-align: center; letter-spacing: 2px;">${barcodeCode}</p>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: #9ca3af; margin-top: 4px; padding: 0 16px;">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>

    <div class="dashed-line" style="margin: 0 16px;"></div>

    <!-- 하단 문구 -->
    <div style="padding: 16px 24px; text-align: center;">
      <p style="font-size: 14px; color: #4b5563;">오늘도 수고하셨습니다 :)</p>
      <div style="margin-top: 8px; font-size: 12px; color: #9ca3af;">
        <p>• 내일도 화이팅!</p>
        <p>• Keep tracking your time</p>
      </div>
    </div>

    <!-- 하단 그라데이션 -->
    <div style="height: 16px; background: linear-gradient(to bottom, white, #f3f4f6); border-radius: 0 0 12px 12px;"></div>
  </div>
</body>
</html>
    `;
  }
}
