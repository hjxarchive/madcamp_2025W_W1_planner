import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { ReceiptSchedulerService } from './receipt-scheduler.service';
import { CreateReceiptDto } from './dto';
import { JwtAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';
import { UsersService } from '../users/users.service';

@Controller('receipts')
@UseGuards(JwtAuthGuard)
export class ReceiptsController {
  private readonly logger = new Logger(ReceiptsController.name);

  constructor(
    private readonly receiptsService: ReceiptsService,
    private readonly receiptSchedulerService: ReceiptSchedulerService,
    private readonly usersService: UsersService,
  ) {}

  // 진단용 엔드포인트: Chromium 및 환경 확인
  @Get('diagnostic')
  async diagnostic() {
    const fs = await import('fs');
    const path = await import('path');
    const { execSync } = await import('child_process');

    const diagnostics: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
    };

    // Chromium 경로 확인
    const chromiumPaths = [
      '/usr/bin/chromium-browser',
      '/usr/bin/chromium',
      '/snap/bin/chromium',
    ];

    diagnostics.chromiumPaths = {};
    for (const p of chromiumPaths) {
      (diagnostics.chromiumPaths as Record<string, boolean>)[p] = fs.existsSync(p);
    }

    // 업로드 디렉토리 확인
    const uploadDir = path.join(process.cwd(), 'uploads', 'receipts');
    diagnostics.uploadDir = {
      path: uploadDir,
      exists: fs.existsSync(uploadDir),
      writable: false,
    };

    if (fs.existsSync(uploadDir)) {
      try {
        fs.accessSync(uploadDir, fs.constants.W_OK);
        (diagnostics.uploadDir as Record<string, unknown>).writable = true;
      } catch {
        (diagnostics.uploadDir as Record<string, unknown>).writable = false;
      }
    }

    // Chromium 버전 확인
    try {
      const chromiumVersion = execSync('chromium-browser --version 2>/dev/null || chromium --version 2>/dev/null || echo "not found"').toString().trim();
      diagnostics.chromiumVersion = chromiumVersion;
    } catch {
      diagnostics.chromiumVersion = 'error checking version';
    }

    return diagnostics;
  }

  @Get()
  async findAll(
    @CurrentUser() user: FirebaseUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      return { data: [], meta: { total: 0, page: 1, limit: 20 } };
    }
    return this.receiptsService.findAll(
      dbUser.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':date')
  async findByDate(
    @CurrentUser() user: FirebaseUser,
    @Param('date') date: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.receiptsService.findByDate(dbUser.id, date);
  }

  @Get(':date/details')
  async getDetails(
    @CurrentUser() user: FirebaseUser,
    @Param('date') date: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.receiptsService.getReceiptDetails(dbUser.id, date);
  }

  @Post()
  async createOrUpdate(
    @CurrentUser() user: FirebaseUser,
    @Body() dto: CreateReceiptDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.receiptsService.createOrUpdate(dbUser.id, dto);
  }

  @Post(':date/generate-image')
  async generateImage(
    @CurrentUser() user: FirebaseUser,
    @Param('date') date: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.receiptsService.generateImage(dbUser.id, date);
  }

  @Delete(':date')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @CurrentUser() user: FirebaseUser,
    @Param('date') date: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    await this.receiptsService.delete(dbUser.id, date);
  }

  /**
   * 관리자용: 특정 날짜의 모든 사용자 영수증 일괄 생성
   * POST /receipts/admin/generate-all/:date
   *
   * 주의: 인증된 사용자만 호출 가능하지만, 모든 사용자의 영수증을 생성합니다.
   * 프로덕션에서는 별도의 관리자 권한 체크를 추가하는 것을 권장합니다.
   */
  @Post('admin/generate-all/:date')
  async generateAllForDate(@Param('date') date: string) {
    this.logger.log(`[Admin] 날짜 ${date}의 전체 영수증 일괄 생성 요청`);
    return this.receiptSchedulerService.generateReceiptsForDate(date);
  }
}
