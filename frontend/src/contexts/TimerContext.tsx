import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState, AppStateStatus, Alert } from 'react-native';
import socketService, {
  TimerStartedPayload,
  TimerStoppedPayload,
  TimerActivePayload,
  TimerTickPayload,
  TimerMemberStartedPayload,
  TimerMemberStoppedPayload,
  TimerErrorPayload,
} from '@services/socket';
import { Project, Task } from '@app-types/index';

export interface MemberTimerState {
  userId: string;
  userName: string;
  checklistContent: string;
  startedAt: string;
}

interface TimerContextType {
  // 연결 상태
  isConnected: boolean;

  // 본인 타이머 상태
  isTimerRunning: boolean;
  elapsedTime: number;
  currentProject: Project | null;
  currentTask: Task | null;
  activeTimeLogId: string | null;

  // 팀원 타이머 상태 (프로젝트 ID -> 멤버 타이머 배열)
  memberTimers: Record<string, MemberTimerState[]>;

  // 액션
  connect: (token: string) => Promise<void>;
  disconnect: () => void;
  startTimer: (checklistId: string, project: Project, task: Task) => void;
  stopTimer: () => void;
  syncTimer: () => void;
  joinProjectRoom: (projectId: string) => void;
  leaveProjectRoom: (projectId: string) => void;

  // 타이머 정지 후 업데이트된 시간을 반환받기 위한 콜백
  onTimerStopped: ((durationMs: number) => void) | null;
  setOnTimerStopped: (callback: ((durationMs: number) => void) | null) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

interface TimerProviderProps {
  children: React.ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [activeTimeLogId, setActiveTimeLogId] = useState<string | null>(null);
  const [memberTimers, setMemberTimers] = useState<Record<string, MemberTimerState[]>>({});
  const [onTimerStopped, setOnTimerStopped] = useState<((durationMs: number) => void) | null>(null);

  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  // 서버에서 받은 elapsedMs와 그 시점의 로컬 시간
  const serverElapsedRef = useRef<number>(0);
  const localBaseTimeRef = useRef<number>(0);
  // START_FAILED 후 sync -> 자동 종료를 위한 플래그
  const pendingStopAfterSyncRef = useRef<boolean>(false);

  // 로컬 타이머 시작 (서버의 elapsedMs 기준)
  const startLocalTimer = useCallback((serverElapsedMs: number) => {
    serverElapsedRef.current = serverElapsedMs;
    localBaseTimeRef.current = Date.now();
    setElapsedTime(Math.max(0, serverElapsedMs));

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      // 서버 elapsedMs + 로컬에서 경과한 시간
      const localElapsed = Date.now() - localBaseTimeRef.current;
      setElapsedTime(Math.max(0, serverElapsedRef.current + localElapsed));
    }, 1000);
  }, []);

  // 로컬 타이머 정지
  const stopLocalTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    serverElapsedRef.current = 0;
    localBaseTimeRef.current = 0;
    setElapsedTime(0);
  }, []);

  // 소켓 연결 상태 콜백 설정
  useEffect(() => {
    socketService.setOnConnectionChange((connected) => {
      console.log('[TimerContext] Socket connection changed:', connected);
      setIsConnected(connected);

      // 연결되면 타이머 상태 동기화
      if (connected) {
        socketService.syncTimer();
      }
    });

    return () => {
      socketService.setOnConnectionChange(null);
    };
  }, []);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    // timer:started - 본인의 타이머가 시작됨
    socketService.onTimerStarted((data: TimerStartedPayload) => {
      console.log('[TimerContext] timer:started', data);
      setActiveTimeLogId(data.timeLog.id);
      setIsTimerRunning(true);
      // 서버에서 받은 elapsedMs 사용 (undefined면 0으로 시작)
      const elapsedMs = data.elapsedMs ?? 0;
      startLocalTimer(elapsedMs);
    });

    // timer:stopped - 본인의 타이머가 정지됨
    socketService.onTimerStopped((data: TimerStoppedPayload) => {
      console.log('[TimerContext] timer:stopped', data);
      // 초 단위 정밀도를 위해 durationMs 사용
      const durationMs = data.durationMs ?? (data.durationMinutes * 60 * 1000);

      if (onTimerStopped) {
        onTimerStopped(durationMs);
      }

      setIsTimerRunning(false);
      setActiveTimeLogId(null);
      setCurrentProject(null);
      setCurrentTask(null);
      stopLocalTimer();
    });

    // timer:active - 활성 타이머가 있음 (sync 응답)
    socketService.onTimerActive((data: TimerActivePayload) => {
      console.log('[TimerContext] timer:active', data);

      // START_FAILED 후 자동 종료가 필요한 경우
      if (pendingStopAfterSyncRef.current) {
        pendingStopAfterSyncRef.current = false;
        // 기존 타이머 종료
        socketService.stopTimer(data.timeLog.id);
        Alert.alert(
          '기존 타이머 종료',
          `이미 진행 중이던 타이머가 종료되었습니다.\n\n프로젝트: ${data.project.title}\n태스크: ${data.checklist.content}`,
        );
        return;
      }

      setActiveTimeLogId(data.timeLog.id);
      setIsTimerRunning(true);

      // 프로젝트와 태스크 정보 설정 (간략한 정보만)
      setCurrentProject({
        id: data.project.id,
        title: data.project.title,
        totalTimeMs: 0,
        memberCount: 1,
        tasks: [],
      });
      setCurrentTask({
        id: data.checklist.id,
        content: data.checklist.content,
        isDone: false,
        durationMs: 0,
        projectId: data.project.id,
      });

      // 서버에서 받은 elapsedMs 사용 (undefined면 0으로 시작)
      const elapsedMs = data.elapsedMs ?? 0;
      startLocalTimer(elapsedMs);
    });

    // timer:none - 활성 타이머 없음 (sync 응답)
    socketService.onTimerNone(() => {
      console.log('[TimerContext] timer:none');
      // START_FAILED 후 sync했는데 활성 타이머가 없는 경우 (다른 기기에서 이미 종료됨)
      if (pendingStopAfterSyncRef.current) {
        pendingStopAfterSyncRef.current = false;
      }
      setIsTimerRunning(false);
      setActiveTimeLogId(null);
      setCurrentProject(null);
      setCurrentTask(null);
      stopLocalTimer();
    });

    // timer:tick - 서버에서 주기적으로 보내는 시간 동기화 (30초마다)
    socketService.onTimerTick((data: TimerTickPayload) => {
      console.log('[TimerContext] timer:tick', data);
      // 서버 시간 기준으로 재동기화
      serverElapsedRef.current = data.elapsedMs;
      localBaseTimeRef.current = Date.now();
      setElapsedTime(Math.max(0, data.elapsedMs));
    });

    // timer:member-started - 팀원이 타이머 시작
    socketService.onTimerMemberStarted((data: TimerMemberStartedPayload) => {
      console.log('[TimerContext] timer:member-started', data);
      setMemberTimers(prev => {
        const projectTimers = prev[data.projectId] || [];
        return {
          ...prev,
          [data.projectId]: [
            ...projectTimers.filter(t => t.userId !== data.userId),
            {
              userId: data.userId,
              userName: data.userName,
              checklistContent: data.checklistContent,
              startedAt: new Date().toISOString(),
            },
          ],
        };
      });
    });

    // timer:member-stopped - 팀원이 타이머 정지
    socketService.onTimerMemberStopped((data: TimerMemberStoppedPayload) => {
      console.log('[TimerContext] timer:member-stopped', data);
      setMemberTimers(prev => {
        const projectTimers = prev[data.projectId] || [];
        return {
          ...prev,
          [data.projectId]: projectTimers.filter(t => t.userId !== data.userId),
        };
      });
    });

    // timer:error - 에러 발생
    socketService.onTimerError((data: TimerErrorPayload) => {
      console.error('[TimerContext] timer:error', data);

      // START_FAILED: 이미 진행 중인 타이머가 있는 경우 자동 종료
      if (data.code === 'START_FAILED') {
        pendingStopAfterSyncRef.current = true;
        // sync로 활성 타이머 정보를 가져와서 자동 종료
        socketService.syncTimer();
        return;
      }

      // 기타 에러는 알림으로 표시
      Alert.alert('타이머 오류', data.message);
    });

    return () => {
      socketService.removeAllTimerListeners();
    };
  }, [onTimerStopped, startLocalTimer, stopLocalTimer]);

  // AppState 변경 감지 (백그라운드 -> 포그라운드 전환 시 동기화)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isConnected
      ) {
        console.log('[TimerContext] App came to foreground, syncing timer');
        socketService.syncTimer();
      }
      appStateRef.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isConnected]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const connect = useCallback(async (token: string) => {
    try {
      await socketService.connect(token);
      setIsConnected(true);
      // 연결 후 즉시 타이머 상태 동기화
      socketService.syncTimer();
    } catch (error) {
      console.error('[TimerContext] Connection failed:', error);
      setIsConnected(false);
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    stopLocalTimer();
  }, [stopLocalTimer]);

  const startTimer = useCallback((checklistId: string, project: Project, task: Task) => {
    // 프로젝트/태스크 정보만 미리 설정 (타이머는 서버 응답 후 시작)
    setCurrentProject(project);
    setCurrentTask(task);
    // 서버에 요청 - timer:started 이벤트에서 실제 타이머 시작
    socketService.startTimer(checklistId);
  }, []);

  const stopTimer = useCallback(() => {
    if (!activeTimeLogId) {
      console.warn('[TimerContext] No active timer to stop');
      return;
    }

    // 서버에 요청 (서버 응답 후 상태 업데이트)
    socketService.stopTimer(activeTimeLogId);
  }, [activeTimeLogId]);

  const syncTimer = useCallback(() => {
    socketService.syncTimer();
  }, []);

  const joinProjectRoom = useCallback((projectId: string) => {
    socketService.joinProjectRoom(projectId);
  }, []);

  const leaveProjectRoom = useCallback((projectId: string) => {
    socketService.leaveProjectRoom(projectId);
  }, []);

  const value: TimerContextType = {
    isConnected,
    isTimerRunning,
    elapsedTime,
    currentProject,
    currentTask,
    activeTimeLogId,
    memberTimers,
    connect,
    disconnect,
    startTimer,
    stopTimer,
    syncTimer,
    joinProjectRoom,
    leaveProjectRoom,
    onTimerStopped,
    setOnTimerStopped,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = (): TimerContextType => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

export default TimerContext;
