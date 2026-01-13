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

type EventCallback<T> = (data: T) => void;

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 시작 딜레이 1초

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
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
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket] Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[Socket] Disconnected:', reason);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
        // 재연결 시 타이머 상태 동기화 요청
        this.emit('timer:sync', {});
      });

      this.socket.on('reconnect_error', (error) => {
        console.error('[Socket] Reconnection error:', error.message);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting');
      this.socket.disconnect();
      this.socket = null;
    }
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
    if (this.socket) {
      this.socket.on(event, callback as any);
    }
  }

  off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
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
}

export const socketService = new SocketService();
export default socketService;
