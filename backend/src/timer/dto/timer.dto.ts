export class TimerStartDto {
  checklistId: string;
}

export class TimerStopDto {
  timeLogId: string;
}

export class RoomJoinDto {
  projectId: string;
}

export class RoomLeaveDto {
  projectId: string;
}

// Server -> Client 이벤트 페이로드
export interface TimerStartedPayload {
  timeLog: {
    id: string;
    checklistId: string;
    userId: string;
    startedAt: Date;
  };
  checklist: {
    id: string;
    content: string;
  };
  project: {
    id: string;
    title: string;
  };
  elapsedMs: number; // 서버 기준 경과 시간 (시작 직후이므로 거의 0)
}

export interface TimerStoppedPayload {
  timeLog: {
    id: string;
    checklistId: string;
    userId: string;
    startedAt: Date;
    endedAt: Date;
  };
  durationMinutes: number;
  durationMs: number; // 초 단위 정밀도를 위한 밀리초
}

export interface TimerActivePayload {
  timeLog: {
    id: string;
    checklistId: string;
    userId: string;
    startedAt: Date;
  };
  checklist: {
    id: string;
    content: string;
  };
  project: {
    id: string;
    title: string;
  };
  elapsedMs: number;
}

export interface TimerTickPayload {
  elapsedMs: number;
  serverTime: Date;
}

export interface TimerMemberStartedPayload {
  userId: string;
  userName: string;
  checklistContent: string;
  projectId: string;
}

export interface TimerMemberStoppedPayload {
  userId: string;
  userName: string;
  durationMinutes: number;
  projectId: string;
}

export interface TimerErrorPayload {
  code: string;
  message: string;
}
