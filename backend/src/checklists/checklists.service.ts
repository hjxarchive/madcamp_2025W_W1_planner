import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto';

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, userId: string, dto: CreateChecklistDto) {
    // 프로젝트 멤버인지 확인
    await this.verifyProjectMembership(projectId, userId);

    // displayOrder 자동 설정
    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const lastChecklist = await this.prisma.checklist.findFirst({
        where: { projectId },
        orderBy: { displayOrder: 'desc' },
      });
      displayOrder = lastChecklist ? lastChecklist.displayOrder + 1 : 0;
    }

    const checklist = await this.prisma.checklist.create({
      data: {
        projectId,
        content: dto.content,
        assigneeId: dto.assigneeId,
        displayOrder,
      },
      include: {
        assignee: true,
        timeLogs: true,
      },
    });

    // 프로젝트 상태 업데이트
    await this.updateProjectStatus(projectId);

    return this.toResponse(checklist);
  }

  async update(checklistId: string, userId: string, dto: UpdateChecklistDto) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
      include: { project: true },
    });

    if (!checklist) {
      throw new NotFoundException('체크리스트를 찾을 수 없습니다');
    }

    await this.verifyProjectMembership(checklist.projectId, userId);

    const updated = await this.prisma.checklist.update({
      where: { id: checklistId },
      data: dto,
      include: {
        assignee: true,
        timeLogs: true,
      },
    });

    // 프로젝트 상태 업데이트
    await this.updateProjectStatus(checklist.projectId);

    return this.toResponse(updated);
  }

  async delete(checklistId: string, userId: string) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      throw new NotFoundException('체크리스트를 찾을 수 없습니다');
    }

    await this.verifyProjectMembership(checklist.projectId, userId);

    await this.prisma.checklist.delete({
      where: { id: checklistId },
    });

    // 프로젝트 상태 업데이트
    await this.updateProjectStatus(checklist.projectId);
  }

  private async verifyProjectMembership(projectId: string, userId: string) {
    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId },
    });
    if (!member) {
      throw new ForbiddenException('프로젝트 멤버만 접근할 수 있습니다');
    }
    return member;
  }

  // 체크리스트 완료 상태에 따라 프로젝트 상태 업데이트
  private async updateProjectStatus(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { checklists: true },
    });

    if (!project || project.status === 'COMPLETED') return;

    const allCompleted =
      project.checklists.length > 0 &&
      project.checklists.every((c) => c.isCompleted);

    const newStatus = allCompleted ? 'PENDING_REVIEW' : 'ACTIVE';

    if (project.status !== newStatus) {
      await this.prisma.project.update({
        where: { id: projectId },
        data: { status: newStatus },
      });
    }
  }

  private toResponse(checklist: any) {
    const totalTimeMinutes = (checklist.timeLogs || []).reduce(
      (sum: number, log: any) => {
        if (!log.endedAt) return sum;
        const durationMs =
          new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime();
        return sum + Math.floor(durationMs / 60000);
      },
      0,
    );

    return {
      id: checklist.id,
      content: checklist.content,
      isCompleted: checklist.isCompleted,
      assigneeId: checklist.assigneeId,
      assigneeNickname: checklist.assignee?.nickname ?? null,
      displayOrder: checklist.displayOrder,
      totalTimeMinutes,
    };
  }
}
