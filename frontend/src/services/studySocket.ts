import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@constants/index';

const getServerUrl = () => {
  return API_BASE_URL.replace(/\/api$/, '');
};

export interface ParticipantInfo {
  sessionId: string;
  userId: string;
  nickname: string;
  profileEmoji: string | null;
  todayTotalMinutes: number;
  joinedAt: string;
  currentProject: string | null;
}

export interface StudyJoinedPayload {
  locationId: string;
}

export interface StudyLeftPayload {
  locationId: string;
}

export interface StudySyncedPayload {
  locationId: string | null;
  locationName?: string;
  participants: ParticipantInfo[];
}

export interface ParticipantsUpdatedPayload {
  locationId: string;
  participants: ParticipantInfo[];
}

export interface StudyErrorPayload {
  code: string;
  message: string;
}

type EventCallback<T> = (data: T) => void;

interface RegisteredListener {
  event: string;
  callback: EventCallback<any>;
}

class StudySocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  // 등록된 리스너 저장 (재연결 시 복원용)
  private registeredListeners: RegisteredListener[] = [];

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      // 기존 소켓 정리
      if (this.socket) {
        this.socket.removeAllListeners();
        this.socket.disconnect();
        this.socket = null;
      }

      const serverUrl = getServerUrl();
      const socketUrl = `${serverUrl}/study`;
      console.log(`[StudySocket] Connecting to ${socketUrl}`);

      this.socket = io(socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 10000,
      });

      this.socket.on('connect', () => {
        console.log('[StudySocket] Connected');
        this.reconnectAttempts = 0;
        // 저장된 리스너 재등록
        this.reregisterListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('[StudySocket] Connection error:', error.message);
        this.reconnectAttempts++;
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect after multiple attempts'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[StudySocket] Disconnected:', reason);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('[StudySocket] Reconnected after', attemptNumber, 'attempts');
        this.reconnectAttempts = 0;
        this.syncStudy();
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('[StudySocket] Disconnecting');
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    // 리스너 목록 초기화 (화면 전환 시 cleanup용)
    this.registeredListeners = [];
  }

  // 저장된 리스너 재등록
  private reregisterListeners(): void {
    if (!this.socket || this.registeredListeners.length === 0) return;

    console.log(`[StudySocket] Re-registering ${this.registeredListeners.length} listeners`);
    for (const { event, callback } of this.registeredListeners) {
      this.socket.on(event, callback as any);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private emit<T>(event: string, data: T): void {
    if (this.socket?.connected) {
      console.log(`[StudySocket] Emit: ${event}`, data);
      this.socket.emit(event, data);
    } else {
      console.warn(`[StudySocket] Cannot emit ${event}: not connected`);
    }
  }

  private on<T>(event: string, callback: EventCallback<T>): void {
    // 중복 등록 방지
    const exists = this.registeredListeners.some(
      l => l.event === event && l.callback === callback
    );
    if (!exists) {
      this.registeredListeners.push({ event, callback });
      console.log(`[StudySocket] Registered listener for: ${event}`);
    }

    // 소켓이 연결되어 있으면 바로 등록
    if (this.socket?.connected) {
      this.socket.on(event, callback as any);
    }
  }

  private off(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
    // 저장된 리스너에서도 제거
    this.registeredListeners = this.registeredListeners.filter(l => l.event !== event);
  }

  // Study actions
  joinStudy(locationId: string): void {
    this.emit('study:join', { locationId });
  }

  leaveStudy(locationId: string): void {
    this.emit('study:leave', { locationId });
  }

  syncStudy(): void {
    this.emit('study:sync', {});
  }

  // Event listeners
  onStudyJoined(callback: EventCallback<StudyJoinedPayload>): void {
    this.on('study:joined', callback);
  }

  onStudyLeft(callback: EventCallback<StudyLeftPayload>): void {
    this.on('study:left', callback);
  }

  onStudySynced(callback: EventCallback<StudySyncedPayload>): void {
    this.on('study:synced', callback);
  }

  onParticipantsUpdated(callback: EventCallback<ParticipantsUpdatedPayload>): void {
    this.on('study:participants-updated', callback);
  }

  onStudyError(callback: EventCallback<StudyErrorPayload>): void {
    this.on('study:error', callback);
  }

  removeAllStudyListeners(): void {
    const events = [
      'study:joined',
      'study:left',
      'study:synced',
      'study:participants-updated',
      'study:error',
    ];
    events.forEach(event => this.off(event));
  }
}

export const studySocketService = new StudySocketService();
export default studySocketService;
