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
