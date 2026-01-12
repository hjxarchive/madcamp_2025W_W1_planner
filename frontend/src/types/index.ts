// ============ 공통 타입 정의 ============
// API 응답과 프론트엔드 UI에서 공통으로 사용하는 타입들

// API에서 반환하는 원본 타입들 (api.ts에서 export됨)
export type {
  User as ApiUser,
  ProjectMember as ApiProjectMember,
  ChecklistItem as ApiChecklistItem,
  ProjectSummary as ApiProjectSummary,
  ProjectDetail as ApiProjectDetail,
  TimeLog as ApiTimeLog,
  TimeLogDetail as ApiTimeLogDetail,
  TodaySummaryResponse as ApiTodaySummary,
  Location as ApiLocation,
  Participant as ApiParticipant,
  DailyReceipt as ApiDailyReceipt,
  PaginatedResponse,
} from '@services/api';

// ============ 프론트엔드 UI용 타입 ============

/** 사용자 정보 */
export interface User {
  id: string;
  nickname: string;
  emoji?: string | null;
  firebaseUid?: string;
}

/** Task (체크리스트 항목) */
export interface Task {
  id: string;
  content: string;
  isDone: boolean;
  durationMs: number;
  projectId: string;
  projectTitle?: string;
  assigneeId?: string | null;
  assigneeName?: string | null;
  displayOrder?: number;
}

/** 프로젝트 멤버 */
export interface Member {
  id: string;
  nickname: string;
  profileEmoji?: string | null;
  timeMs: number;
  progress: number;
  role?: 'owner' | 'member';
}

/** 보고서 */
export interface Report {
  rating: number;
  memo?: string;
  createdAt: Date;
  totalTimeMs: number;
  completedTasks: number;
}

/** 프로젝트 */
export interface Project {
  id: string;
  title: string;
  totalTimeMs: number;
  dueDate?: Date | null;
  memberCount: number;
  tasks: Task[];
  members?: Member[];
  report?: Report | null;
  status?: 'ACTIVE' | 'PENDING_REVIEW' | 'COMPLETED';
  coverImageUrl?: string | null;
}

/** 타이머 상태 */
export interface TimerState {
  isRunning: boolean;
  elapsedTime: number;
  currentProject: Project | null;
  currentTask: Task | null;
  activeTimeLogId: string | null;
}

/** 일일 아카이브 */
export interface DailyArchive {
  date: Date;
  tasks: { taskName: string; projectName: string; durationMs: number }[];
  totalTimeMs: number;
  timeSlots: { active: boolean }[];
  recordedAt?: Date;
}

// ============ 변환 함수 ============
import type {
  User as ApiUserType,
  ProjectSummary,
  ProjectDetail,
  ChecklistItem,
  ProjectMember,
  TodaySummaryResponse,
} from '@services/api';

/** API User → UI User 변환 */
export const transformApiUser = (apiUser: ApiUserType): User => ({
  id: apiUser.id,
  nickname: apiUser.nickname,
  emoji: apiUser.profileEmoji,
  firebaseUid: apiUser.firebaseUid,
});

/** API ChecklistItem → UI Task 변환 */
export const transformChecklist = (
  checklist: ChecklistItem,
  projectId: string,
  projectTitle?: string
): Task => {
  console.log('transformChecklist - input:', { id: checklist.id, content: checklist.content, totalTimeMinutes: checklist.totalTimeMinutes });
  const durationMs = checklist.totalTimeMinutes * 60 * 1000;
  console.log('transformChecklist - durationMs:', durationMs);
  return {
    id: checklist.id,
    content: checklist.content,
    isDone: checklist.isCompleted,
    durationMs, // minutes → ms
    projectId,
    projectTitle,
    assigneeId: checklist.assigneeId,
    assigneeName: checklist.assigneeNickname,
    displayOrder: checklist.displayOrder,
  };
};

/** API ProjectMember → UI Member 변환 */
export const transformMember = (member: ProjectMember, totalTimeMinutes: number = 0): Member => ({
  id: member.userId,
  nickname: member.nickname,
  profileEmoji: member.profileEmoji,
  timeMs: totalTimeMinutes * 60 * 1000,
  progress: 0, // 개별 진행률은 서버에서 계산 필요
  role: member.role,
});

/** API ProjectSummary → UI Project 변환 */
export const transformProjectSummary = (summary: ProjectSummary): Project => ({
  id: summary.id,
  title: summary.title,
  totalTimeMs: summary.totalTimeMinutes * 60 * 1000,
  dueDate: summary.plannedEndDate ? new Date(summary.plannedEndDate) : null,
  memberCount: summary.memberCount,
  tasks: [], // Summary에는 task 목록이 없음
  status: summary.status,
  coverImageUrl: summary.coverImageUrl,
  report: summary.status === 'COMPLETED' && summary.rating
    ? {
        rating: summary.rating,
        createdAt: summary.completedAt ? new Date(summary.completedAt) : new Date(),
        totalTimeMs: summary.totalTimeMinutes * 60 * 1000,
        completedTasks: summary.completedChecklistCount,
      }
    : null,
});

/** API ProjectDetail → UI Project 변환 */
export const transformProjectDetail = (detail: ProjectDetail): Project => ({
  id: detail.id,
  title: detail.title,
  totalTimeMs: detail.checklists.reduce((sum, c) => sum + c.totalTimeMinutes, 0) * 60 * 1000,
  dueDate: detail.plannedEndDate ? new Date(detail.plannedEndDate) : null,
  memberCount: detail.members.length,
  tasks: detail.checklists.map(c => transformChecklist(c, detail.id, detail.title)),
  members: detail.members.map(m => transformMember(m)),
  status: detail.status,
  coverImageUrl: detail.coverImageUrl,
  report: detail.status === 'COMPLETED' && detail.rating
    ? {
        rating: detail.rating,
        createdAt: detail.completedAt ? new Date(detail.completedAt) : new Date(),
        totalTimeMs: detail.checklists.reduce((sum, c) => sum + c.totalTimeMinutes, 0) * 60 * 1000,
        completedTasks: detail.checklists.filter(c => c.isCompleted).length,
      }
    : null,
});

/** API TodaySummary → DailyArchive 변환 */
export const transformTodaySummary = (summary: TodaySummaryResponse): DailyArchive => {
  const tasks = summary.timeLogs.map(log => ({
    taskName: log.checklistContent,
    projectName: log.projectTitle,
    durationMs: log.durationMinutes * 60 * 1000,
  }));

  // 24시간 타임슬롯 생성
  const timeSlots = Array.from({ length: 24 }, (_, hour) => {
    const hasActivity = summary.timeLogs.some(log => {
      const logHour = new Date(log.startedAt).getHours();
      return logHour === hour;
    });
    return { active: hasActivity };
  });

  return {
    date: new Date(summary.date),
    tasks,
    totalTimeMs: summary.totalMinutes * 60 * 1000,
    timeSlots,
    recordedAt: new Date(),
  };
};
