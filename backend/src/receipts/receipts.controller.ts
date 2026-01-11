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
} from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto } from './dto';
import { FirebaseAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';
import { UsersService } from '../users/users.service';

@Controller('receipts')
@UseGuards(FirebaseAuthGuard)
export class ReceiptsController {
  constructor(
    private readonly receiptsService: ReceiptsService,
    private readonly usersService: UsersService,
  ) {}

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
}
