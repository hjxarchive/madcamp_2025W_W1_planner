import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@constants/index';

// Socket.IO는 http:// 프로토콜을 사용 (ws:// 아님)
// API_BASE_URL: http://172.10.5.61/api → 서버 주소: http://172.10.5.61
const getServerUrl = () => {
  // API_BASE_URL에서 /api 제거
  return API_BASE_URL.replace(/\/api$/, '');
};

// Server -> Client 이벤트 페이로드 타입
export interface TimerStartedPayload {
  timeLog: {
    id: string;
    checklistId: string;
    userId: string;
    startedAt: string;
  };
  checklist: {
    id: string;
    content: string;
  };
  project: {
    id: string;
    title: string;
  };
  elapsedMs: number; // 서버 기준 경과 시간
}

export interface TimerStoppedPayload {
  timeLog: {
    id: string;
    checklistId: string;
    userId: string;
    startedAt: string;
    endedAt: string;
  };
  durationMinutes: number;
  durationMs: number; // 초 단위 정밀도를 위한 밀리초
}

export interface TimerActivePayload {
  timeLog: {
    id: string;
    checklistId: string;
    userId: string;
    startedAt: string;
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
  serverTime: string;
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

// ========== 실시간 동기화 이벤트 페이로드 ==========

export interface UserUpdatedPayload {
  userId: string;
  nickname: string;
  profileEmoji?: string;
}

export interface ChecklistPayload {
  id: string;
  content: string;
  isCompleted: boolean;
  assigneeId: string | null;
  assigneeNickname: string | null;
  displayOrder: number;
  totalTimeMinutes: number;
}

export interface ChecklistCreatedPayload {
  projectId: string;
  checklist: ChecklistPayload;
  createdByUserId: string;
}

export interface ChecklistUpdatedPayload {
  projectId: string;
  checklist: ChecklistPayload;
  updatedByUserId: string;
}

export interface ChecklistDeletedPayload {
  projectId: string;
  checklistId: string;
  deletedByUserId: string;
}

export interface TaskAssignedPayload {
  checklistId: string;
  projectId: string;
  projectTitle: string;
  taskContent: string;
  assignedByUserId: string;
  assignedByNickname: string;
}

export interface ProjectTimeUpdatedPayload {
  projectId: string;
  totalTimeMs: number;
}

type EventCallback<T> = (data: T) => void;

// 리스너 타입
interface RegisteredListener {
  event: string;
  callback: EventCallback<any>;
}

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 시작 딜레이 1초
  // 등록된 모든 리스너들을 저장 (재연결 시 복원용)
  private registeredListeners: RegisteredListener[] = [];
  // 연결 상태 변경 콜백
  private onConnectionChange: ((connected: boolean) => void) | null = null;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 이미 연결된 경우
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // 기존 소켓이 있으면 정리
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const serverUrl = getServerUrl();
      const socketUrl = `${serverUrl}/timer`;
      console.log(`[Socket] Connecting to ${socketUrl}`);

      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'], // WebSocket 우선, 폴링 fallback
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket] Connected');
        this.reconnectAttempts = 0;
        // 저장된 리스너들 재등록
        this.reregisterListeners();
        // 연결 상태 콜백 호출
        this.onConnectionChange?.(true);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          this.onConnectionChange?.(false);
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
        this.onConnectionChange?.(false);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
        // 재연결 시 타이머 상태 동기화 요청
        this.emit('timer:sync', {});
        this.onConnectionChange?.(true);
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('[Socket] Reconnection error:', error.message);
      });
    });
  }

  // 연결 상태 변경 콜백 설정
  setOnConnectionChange(callback: ((connected: boolean) => void) | null): void {
    this.onConnectionChange = callback;
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    // 연결 상태 콜백 호출
    this.onConnectionChange?.(false);
    // 주의: registeredListeners는 유지 (재연결 시 복원을 위해)
  }

  // 완전 초기화 (로그아웃 시 사용)
  reset(): void {
    this.disconnect();
    this.registeredListeners = [];
    console.log('[Socket] Reset - all listeners cleared');
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  emit<T>(event: string, data: T): void {
    if (this.socket?.connected) {
      console.log(`[Socket] Emit: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`[Socket] Cannot emit ${event}: not connected`);
    }
  }

  on<T>(event: string, callback: EventCallback<T>): void {
    // 중복 등록 방지 (같은 이벤트+콜백 조합이 있으면 무시)
    const exists = this.registeredListeners.some(
      l => l.event === event && l.callback === callback
    );
    if (!exists) {
      // 리스너 목록에 저장 (재연결 시 복원용)
      this.registeredListeners.push({ event, callback });
      console.log(`[Socket] Registered listener for: ${event} (total: ${this.registeredListeners.length})`);
    }

    // 소켓이 연결되어 있으면 바로 등록
    if (this.socket?.connected) {
      this.socket.on(event, callback as any);
    }
  }

  // 저장된 리스너들을 소켓에 재등록
  private reregisterListeners(): void {
    if (!this.socket || this.registeredListeners.length === 0) return;

    console.log(`[Socket] Re-registering ${this.registeredListeners.length} listeners`);
    for (const { event, callback } of this.registeredListeners) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
    // 저장된 리스너에서도 제거
    this.registeredListeners = this.registeredListeners.filter(l => l.event !== event);
  }

  // Timer 관련 이벤트 emit 헬퍼
  startTimer(checklistId: string): void {
    this.emit('timer:start', { checklistId });
  }

  stopTimer(timeLogId: string): void {
    this.emit('timer:stop', { timeLogId });
  }

  syncTimer(): void {
    this.emit('timer:sync', {});
  }

  joinProjectRoom(projectId: string): void {
    this.emit('room:join', { projectId });
  }

  leaveProjectRoom(projectId: string): void {
    this.emit('room:leave', { projectId });
  }

  // Timer 이벤트 리스너 등록 헬퍼
  onTimerStarted(callback: EventCallback<TimerStartedPayload>): void {
    this.on('timer:started', callback);
  }

  onTimerStopped(callback: EventCallback<TimerStoppedPayload>): void {
    this.on('timer:stopped', callback);
  }

  onTimerActive(callback: EventCallback<TimerActivePayload>): void {
    this.on('timer:active', callback);
  }

  onTimerNone(callback: EventCallback<Record<string, never>>): void {
    this.on('timer:none', callback);
  }

  onTimerTick(callback: EventCallback<TimerTickPayload>): void {
    this.on('timer:tick', callback);
  }

  onTimerMemberStarted(callback: EventCallback<TimerMemberStartedPayload>): void {
    this.on('timer:member-started', callback);
  }

  onTimerMemberStopped(callback: EventCallback<TimerMemberStoppedPayload>): void {
    this.on('timer:member-stopped', callback);
  }

  onTimerError(callback: EventCallback<TimerErrorPayload>): void {
    this.on('timer:error', callback);
  }

  // 모든 타이머 이벤트 리스너 해제
  removeAllTimerListeners(): void {
    const events = [
      'timer:started',
      'timer:stopped',
      'timer:active',
      'timer:none',
      'timer:tick',
      'timer:member-started',
      'timer:member-stopped',
      'timer:error',
    ];
    events.forEach(event => this.off(event));
  }

  // ========== 실시간 동기화 이벤트 리스너 헬퍼 ==========

  onUserUpdated(callback: EventCallback<UserUpdatedPayload>): void {
    this.on('user:updated', callback);
  }

  onChecklistCreated(callback: EventCallback<ChecklistCreatedPayload>): void {
    this.on('checklist:created', callback);
  }

  onChecklistUpdated(callback: EventCallback<ChecklistUpdatedPayload>): void {
    this.on('checklist:updated', callback);
  }

  onChecklistDeleted(callback: EventCallback<ChecklistDeletedPayload>): void {
    this.on('checklist:deleted', callback);
  }

  onTaskAssigned(callback: EventCallback<TaskAssignedPayload>): void {
    this.on('task:assigned', callback);
  }

  onProjectTimeUpdated(callback: EventCallback<ProjectTimeUpdatedPayload>): void {
    this.on('project:time-updated', callback);
  }

  // 모든 실시간 동기화 이벤트 리스너 해제
  removeAllRealtimeListeners(): void {
    const events = [
      'user:updated',
      'checklist:created',
      'checklist:updated',
      'checklist:deleted',
      'task:assigned',
      'project:time-updated',
    ];
    events.forEach(event => this.off(event));
  }
}

export const socketService = new SocketService();
export default socketService;
