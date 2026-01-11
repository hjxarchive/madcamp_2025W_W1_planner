import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { StudySessionsService } from './study-sessions.service';
import { FirebaseAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';
import { UsersService } from '../users/users.service';

@Controller()
@UseGuards(FirebaseAuthGuard)
export class StudySessionsController {
  constructor(
    private readonly studySessionsService: StudySessionsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('locations/:locationId/join')
  async join(
    @CurrentUser() user: FirebaseUser,
    @Param('locationId') locationId: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.studySessionsService.join(dbUser.id, locationId);
  }

  @Post('study-sessions/:id/leave')
  async leave(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.studySessionsService.leave(dbUser.id, id);
  }
}
