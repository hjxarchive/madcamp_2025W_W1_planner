import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  CompleteProjectDto,
  AddMemberDto,
} from './dto';
import { FirebaseAuthGuard, CurrentUser } from '../common';
import type { FirebaseUser } from '../common';
import { UsersService } from '../users/users.service';

@Controller('projects')
@UseGuards(FirebaseAuthGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  @Get('current')
  async getCurrent(
    @CurrentUser() user: FirebaseUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      return { data: [], meta: { total: 0, page: 1, limit: 20 } };
    }
    return this.projectsService.findCurrentProjects(
      dbUser.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('past')
  async getPast(
    @CurrentUser() user: FirebaseUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      return { data: [], meta: { total: 0, page: 1, limit: 20 } };
    }
    return this.projectsService.findPastProjects(
      dbUser.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  async getOne(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.projectsService.findOne(id, dbUser.id);
  }

  @Post()
  async create(
    @CurrentUser() user: FirebaseUser,
    @Body() dto: CreateProjectDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.projectsService.create(dbUser.id, dto);
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.projectsService.update(id, dbUser.id, dto);
  }

  @Post(':id/complete')
  async complete(
    @CurrentUser() user: FirebaseUser,
    @Param('id') id: string,
    @Body() dto: CompleteProjectDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.projectsService.complete(id, dbUser.id, dto.rating);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: FirebaseUser, @Param('id') id: string) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    await this.projectsService.delete(id, dbUser.id);
  }

  // 멤버 관리
  @Post(':projectId/members')
  async addMember(
    @CurrentUser() user: FirebaseUser,
    @Param('projectId') projectId: string,
    @Body() dto: AddMemberDto,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    return this.projectsService.addMember(
      projectId,
      dbUser.id,
      dto.userId,
      dto.role,
    );
  }

  @Delete(':projectId/members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() user: FirebaseUser,
    @Param('projectId') projectId: string,
    @Param('userId') targetUserId: string,
  ) {
    const dbUser = await this.usersService.findByFirebaseUid(user.firebaseUid);
    if (!dbUser) {
      throw new Error('사용자를 찾을 수 없습니다');
    }
    await this.projectsService.removeMember(projectId, dbUser.id, targetUserId);
  }
}
