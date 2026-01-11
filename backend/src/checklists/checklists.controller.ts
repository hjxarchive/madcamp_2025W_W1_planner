import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto';
import { FirebaseAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';
import { UsersService } from '../users/users.service';

@Controller()
@UseGuards(FirebaseAuthGuard)
export class ChecklistsController {
  constructor(
    private readonly checklistsService: ChecklistsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('projects/:projectId/checklists')
  async create(
    @CurrentUser() user: FirebaseUser,
    @Param('projectId') projectId: string,
    @Body() dto: CreateChecklistDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.checklistsService.create(projectId, dbUser.id, dto);
  }

  @Patch('checklists/:id')
  async update(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
    @Body() dto: UpdateChecklistDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.checklistsService.update(id, dbUser.id, dto);
  }

  @Delete('checklists/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    await this.checklistsService.delete(id, dbUser.id);
  }
}
