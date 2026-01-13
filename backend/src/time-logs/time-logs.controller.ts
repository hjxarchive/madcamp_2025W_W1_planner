import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { JwtAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';
import { UsersService } from '../users/users.service';

@Controller()
@UseGuards(JwtAuthGuard)
export class TimeLogsController {
  constructor(
    private readonly timeLogsService: TimeLogsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('checklists/:checklistId/time-logs/start')
  async startTimer(
    @CurrentUser() user: FirebaseUser,
    @Param('checklistId') checklistId: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.timeLogsService.startTimer(dbUser.id, checklistId);
  }

  @Post('time-logs/:id/stop')
  async stopTimer(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.timeLogsService.stopTimer(dbUser.id, id);
  }

  @Get('time-logs/today')
  async getTodaySummary(@CurrentUser() user: FirebaseUser) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.timeLogsService.getTodaySummary(dbUser.id);
  }
}
