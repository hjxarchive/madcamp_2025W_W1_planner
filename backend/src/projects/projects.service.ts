import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // 현재 진행 중인 프로젝트 목록
  async findCurrentProjects(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      members: { some: { userId } },
      status: { in: ['ACTIVE', 'PENDING_REVIEW'] },
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          members: { include: { user: true } },
          checklists: { include: { timeLogs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects.map((p) => this.toSummary(p)),
      meta: { total, page, limit },
    };
  }

  // 완료된 프로젝트 목록
  async findPastProjects(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      members: { some: { userId } },
      status: 'COMPLETED',
    };

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        include: {
          members: { include: { user: true } },
          checklists: { include: { timeLogs: true } },
        },
        orderBy: { completedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      data: projects.map((p) => this.toSummary(p)),
      meta: { total, page, limit },
    };
  }

  // 프로젝트 상세 조회
  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: { include: { user: true } },
        checklists: {
          include: {
            timeLogs: true,
            assignee: true,
          },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    // 멤버 권한 확인
    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    return this.toDetail(project);
  }

  // 프로젝트 생성
  async create(userId: string, dto: CreateProjectDto) {
    const memberUserIds = [userId];

    // 닉네임으로 멤버 찾기
    if (dto.memberNicknames?.length) {
      for (const nickname of dto.memberNicknames) {
        const user = await this.prisma.user.findUnique({
          where: { nickname },
        });
        if (!user) {
          throw new NotFoundException(`사용자를 찾을 수 없습니다: ${nickname}`);
        }
        if (!memberUserIds.includes(user.id)) {
          memberUserIds.push(user.id);
        }
      }
    }

    const project = await this.prisma.project.create({
      data: {
        title: dto.title,
        coverImageUrl: dto.coverImageUrl,
        plannedStartDate: dto.plannedStartDate
          ? new Date(dto.plannedStartDate)
          : null,
        plannedEndDate: dto.plannedEndDate
          ? new Date(dto.plannedEndDate)
          : null,
        createdBy: userId,
        members: {
          create: memberUserIds.map((uid, index) => ({
            userId: uid,
            role: index === 0 ? 'owner' : 'member',
          })),
        },
      },
      include: {
        members: { include: { user: true } },
        checklists: {
          include: {
            timeLogs: true,
            assignee: true,
          },
        },
      },
    });

    return this.toDetail(project);
  }

  // 프로젝트 수정
  async update(id: string, userId: string, dto: UpdateProjectDto) {
    await this.verifyMembership(id, userId);

    const project = await this.prisma.project.update({
      where: { id },
      data: {
        title: dto.title,
        coverImageUrl: dto.coverImageUrl,
        plannedStartDate: dto.plannedStartDate
          ? new Date(dto.plannedStartDate)
          : undefined,
        plannedEndDate: dto.plannedEndDate
          ? new Date(dto.plannedEndDate)
          : undefined,
      },
      include: {
        members: { include: { user: true } },
        checklists: {
          include: {
            timeLogs: true,
            assignee: true,
          },
        },
      },
    });

    return this.toDetail(project);
  }

  // 프로젝트 완료
  async complete(id: string, userId: string, rating: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: { members: true },
    });

    if (!project) {
      throw new NotFoundException('프로젝트를 찾을 수 없습니다');
    }

    if (project.status === 'COMPLETED') {
      throw new BadRequestException('이미 완료된 프로젝트입니다');
    }

    const isMember = project.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }

    // 트랜잭션: 모든 체크리스트 완료 + 프로젝트 상태 변경
    const [, updatedProject] = await this.prisma.$transaction([
      this.prisma.checklist.updateMany({
        where: { projectId: id },
        data: { isCompleted: true },
      }),
      this.prisma.project.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          rating,
          completedAt: new Date(),
        },
        include: {
          checklists: {
            include: { timeLogs: true },
          },
        },
      }),
    ]);

    return {
      id: updatedProject.id,
      title: updatedProject.title,
      rating: updatedProject.rating,
      completedAt: updatedProject.completedAt,
      totalTimeMinutes: this.calculateTotalTime(updatedProject.checklists),
      message: '프로젝트가 완료되었습니다',
    };
  }

  // 프로젝트 삭제
  async delete(id: string, userId: string) {
    await this.verifyOwnership(id, userId);
    await this.prisma.project.delete({ where: { id } });
  }

  // 멤버 추가
  async addMember(
    projectId: string,
    userId: string,
    targetUserId: string,
    role: 'owner' | 'member' = 'member',
  ) {
    await this.verifyOwnership(projectId, userId);

    // 이미 멤버인지 확인
    const existing = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
    });

    if (existing) {
      throw new BadRequestException('이미 프로젝트 멤버입니다');
    }

    const member = await this.prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUserId,
        role,
      },
      include: { user: true },
    });

    return {
      id: member.id,
      userId: member.userId,
      nickname: member.user.nickname,
      profileEmoji: member.user.profileEmoji,
      role: member.role,
    };
  }

  // 멤버 삭제
  async removeMember(projectId: string, userId: string, targetUserId: string) {
    await this.verifyOwnership(projectId, userId);

    const member = await this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
    });

    if (!member) {
      throw new NotFoundException('멤버를 찾을 수 없습니다');
    }

    if (member.role === 'owner') {
      throw new BadRequestException('프로젝트 소유자는 삭제할 수 없습니다');
    }

    await this.prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId: targetUserId },
      },
    });
  }

  // === Helper Methods ===

  private async verifyMembership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException('접근 권한이 없습니다');
    }
    return member;
  }

  private async verifyOwnership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId, role: 'owner' },
    });
    if (!member) {
      throw new ForbiddenException('프로젝트 소유자만 수행할 수 있습니다');
    }
    return member;
  }

  private toSummary(project: any) {
    const completedCount = project.checklists.filter(
      (c: any) => c.isCompleted,
    ).length;
    const totalTime = this.calculateTotalTime(project.checklists);

    return {
      id: project.id,
      title: project.title,
      coverImageUrl: project.coverImageUrl,
      plannedStartDate: project.plannedStartDate
        ? this.formatDate(project.plannedStartDate)
        : null,
      plannedEndDate: project.plannedEndDate
        ? this.formatDate(project.plannedEndDate)
        : null,
      status: project.status,
      rating: project.rating,
      completedAt: project.completedAt,
      memberCount: project.members.length,
      completedChecklistCount: completedCount,
      totalChecklistCount: project.checklists.length,
      totalTimeMinutes: totalTime,
      createdAt: project.createdAt,
    };
  }

  private toDetail(project: any) {
    return {
      id: project.id,
      title: project.title,
      coverImageUrl: project.coverImageUrl,
      plannedStartDate: project.plannedStartDate
        ? this.formatDate(project.plannedStartDate)
        : null,
      plannedEndDate: project.plannedEndDate
        ? this.formatDate(project.plannedEndDate)
        : null,
      status: project.status,
      rating: project.rating,
      completedAt: project.completedAt,
      members: project.members.map((m: any) => ({
        id: m.id,
        userId: m.userId,
        nickname: m.user.nickname,
        profileEmoji: m.user.profileEmoji,
        role: m.role,
      })),
      checklists: project.checklists.map((c: any) => ({
        id: c.id,
        content: c.content,
        isCompleted: c.isCompleted,
        assigneeId: c.assigneeId,
        assigneeNickname: c.assignee?.nickname ?? null,
        displayOrder: c.displayOrder,
        totalTimeMinutes: this.calculateChecklistTime(c.timeLogs || []),
      })),
      createdAt: project.createdAt,
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private calculateTotalTime(checklists: any[]) {
    return checklists.reduce((sum, c) => {
      return sum + this.calculateChecklistTime(c.timeLogs || []);
    }, 0);
  }

  private calculateChecklistTime(timeLogs: any[]) {
    return timeLogs.reduce((sum: number, log: any) => {
      if (!log.endedAt) return sum;
      const durationMs =
        new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime();
      return sum + Math.floor(durationMs / 60000);
    }, 0);
  }
}
