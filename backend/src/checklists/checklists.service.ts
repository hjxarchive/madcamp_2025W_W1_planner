import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto';
import { TimerGateway } from '../timer/timer.gateway';

@Injectable()
export class ChecklistsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => TimerGateway))
    private timerGateway: TimerGateway,
  ) {}

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

    const response = this.toResponse(checklist);

    // 실시간 브로드캐스트: Task 생성
    this.timerGateway.broadcastChecklistCreated(projectId, response, userId);

    return response;
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

    // 이전 assigneeId 저장 (할당 변경 감지용)
    const previousAssigneeId = checklist.assigneeId;

    const updated = await this.prisma.checklist.update({
      where: { id: checklistId },
      data: dto,
      include: {
        assignee: true,
        timeLogs: true,
        project: true,
      },
    });

    // 프로젝트 상태 업데이트
    await this.updateProjectStatus(checklist.projectId);

    const response = this.toResponse(updated);

    // 실시간 브로드캐스트: Task 수정
    this.timerGateway.broadcastChecklistUpdated(
      checklist.projectId,
      response,
      userId,
    );

    // assigneeId가 변경되었고, 새로운 담당자가 있으면 알림
    if (
      dto.assigneeId &&
      dto.assigneeId !== previousAssigneeId &&
      dto.assigneeId !== userId
    ) {
      // 변경한 사람 정보 조회
      const updater = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      this.timerGateway.notifyTaskAssigned(dto.assigneeId, {
        checklistId: updated.id,
        projectId: checklist.projectId,
        projectTitle: updated.project.title,
        taskContent: updated.content,
        assignedByUserId: userId,
        assignedByNickname: updater?.nickname || 'Unknown',
      });
    }

    return response;
  }

  async delete(checklistId: string, userId: string) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id: checklistId },
    });

    if (!checklist) {
      throw new NotFoundException('체크리스트를 찾을 수 없습니다');
    }

    const projectId = checklist.projectId;

    await this.verifyProjectMembership(projectId, userId);

    await this.prisma.checklist.delete({
      where: { id: checklistId },
    });

    // 프로젝트 상태 업데이트
    await this.updateProjectStatus(projectId);

    // 실시간 브로드캐스트: Task 삭제
    this.timerGateway.broadcastChecklistDeleted(projectId, checklistId, userId);
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
    // 초 단위 정밀도로 계산
    const totalTimeMs = (checklist.timeLogs || []).reduce(
      (sum: number, log: any) => {
        if (!log.endedAt) return sum;
        const durationMs =
          new Date(log.endedAt).getTime() - new Date(log.startedAt).getTime();
        return sum + durationMs;
      },
      0,
    );
    const totalTimeMinutes = Math.floor(totalTimeMs / 60000);
    const totalTimeSeconds = Math.floor(totalTimeMs / 1000);

    return {
      id: checklist.id,
      content: checklist.content,
      isCompleted: checklist.isCompleted,
      assigneeId: checklist.assigneeId,
      assigneeNickname: checklist.assignee?.nickname ?? null,
      displayOrder: checklist.displayOrder,
      totalTimeMinutes,
      totalTimeSeconds, // 초 단위 정밀도
    };
  }
}
