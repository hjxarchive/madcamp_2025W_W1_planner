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
  const startedAtRef = useRef<Date | null>(null);

  // 로컬 타이머 시작
  const startLocalTimer = useCallback((startedAt: Date) => {
    startedAtRef.current = startedAt;
    const initialElapsed = Date.now() - startedAt.getTime();
    setElapsedTime(initialElapsed);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    timerIntervalRef.current = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedTime(Date.now() - startedAtRef.current.getTime());
      }
    }, 1000);
  }, []);

  // 로컬 타이머 정지
  const stopLocalTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    startedAtRef.current = null;
    setElapsedTime(0);
  }, []);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    // timer:started - 본인의 타이머가 시작됨
    socketService.onTimerStarted((data: TimerStartedPayload) => {
      console.log('[TimerContext] timer:started', data);
      setActiveTimeLogId(data.timeLog.id);
      setIsTimerRunning(true);
      startLocalTimer(new Date(data.timeLog.startedAt));
    });

    // timer:stopped - 본인의 타이머가 정지됨
    socketService.onTimerStopped((data: TimerStoppedPayload) => {
      console.log('[TimerContext] timer:stopped', data);
      const durationMs = data.durationMinutes * 60 * 1000;

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

      startLocalTimer(new Date(data.timeLog.startedAt));
    });

    // timer:none - 활성 타이머 없음 (sync 응답)
    socketService.onTimerNone(() => {
      console.log('[TimerContext] timer:none');
      setIsTimerRunning(false);
      setActiveTimeLogId(null);
      setCurrentProject(null);
      setCurrentTask(null);
      stopLocalTimer();
    });

    // timer:tick - 서버에서 주기적으로 보내는 시간 동기화
    socketService.onTimerTick((data: TimerTickPayload) => {
      console.log('[TimerContext] timer:tick', data);
      // 서버 시간으로 보정
      setElapsedTime(data.elapsedMs);
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
    // Optimistic update
    setCurrentProject(project);
    setCurrentTask(task);
    setIsTimerRunning(true);
    startLocalTimer(new Date());

    // 서버에 요청
    socketService.startTimer(checklistId);
  }, [startLocalTimer]);

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
