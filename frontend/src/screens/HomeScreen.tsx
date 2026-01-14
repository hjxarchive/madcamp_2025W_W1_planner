import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  AppState,
  AppStateStatus,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { TotalTimeDisplay, TaskItem, ProjectCard, FloatingTimer, ProfileModal, FocusModeModal, CreateProjectModal, ArchiveReceipt } from '@components/index';
import { api } from '@services/api';
import socketService, { TaskAssignedPayload } from '@services/socket';
import { COLORS, FONT_SIZES, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS, formatTime, formatTimeShort, IMAGE_BASE_URL } from '@constants/index';
import type { RootStackParamList } from '@navigation/RootNavigator';
import type { User, Project, Task, TimerState } from '../types';
import { transformApiUser, transformProjectSummary, transformProjectDetail } from '../types';
import { useTimer } from '@contexts/TimerContext';

// Sample data - API 연결 실패 시 폴백용
const sampleUser: User = {
  id: 'user-1',
  nickname: 'Guest',
  emoji: '🦊',
};

const sampleProjects: Project[] = [
  {
    id: 'sample-proj-1',
    title: '샘플 프로젝트',
    totalTimeMs: 3600000,
    dueDate: new Date('2026-01-15'),
    memberCount: 1,
    tasks: [
      { id: 'sample-t1', content: '샘플 Task 1', isDone: false, durationMs: 1800000, projectId: 'sample-proj-1' },
      { id: 'sample-t2', content: '샘플 Task 2', isDone: false, durationMs: 1800000, projectId: 'sample-proj-1' },
    ],
  },
];

// 오늘의 Task 가져오기 (모든 프로젝트에서)
// 팀 프로젝트의 경우 나에게 할당된 Task만 표시
const getTodayTasks = (projects: Project[], currentUserId: string | null): Task[] => {
  const tasks: Task[] = [];
  projects.forEach(project => {
    if (!project.report) {
      const isTeamProject = project.memberCount > 1;
      project.tasks.forEach(task => {
        if (!task.isDone) {
          // 팀 프로젝트: 나에게 할당된 Task만 표시 (assigneeId가 null이면 미할당이므로 제외)
          // 개인 프로젝트: 모든 Task 표시
          if (isTeamProject) {
            if (task.assigneeId === currentUserId) {
              tasks.push({ ...task, projectTitle: project.title, projectId: project.id });
            }
          } else {
            tasks.push({ ...task, projectTitle: project.title, projectId: project.id });
          }
        }
      });
    }
  });
  return tasks;
};

// 진행률 계산
const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.isDone).length;
  return Math.round((completed / tasks.length) * 100);
};

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

// 영수증 데이터 타입
interface ReceiptData {
  date: string;
  tasks: { taskName: string; projectName: string; durationMs: number }[];
  totalTimeMs: number;
  timeSlots: boolean[];
  imageUrl: string | null;
}

// 서버 Base URL (이미지 URL 생성용)
const getImageBaseUrl = () => {
  return IMAGE_BASE_URL;
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User>(sampleUser);
  const [projects, setProjects] = useState<Project[]>([]);

  // Timer from context
  const {
    isTimerRunning,
    elapsedTime,
    currentProject,
    currentTask,
    startTimer,
    stopTimer,
  } = useTimer();

  // Profile modal state
  const [showProfile, setShowProfile] = useState(false);

  // Focus mode state
  const [showFocusMode, setShowFocusMode] = useState(false);

  // Create project modal state
  const [showCreateProject, setShowCreateProject] = useState(false);

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false);

  // 오늘의 총 시간 (자정에 리셋됨)
  const [todayTotalTimeMs, setTodayTotalTimeMs] = useState(0);

  // 프로젝트 전체 시간 계산 (참고용)
  const projectTotalTimeMs = projects.reduce((sum, p) => sum + p.totalTimeMs, 0);

  // 오늘의 Task
  const todayTasks = getTodayTasks(projects, user?.id ?? null);

  const loadData = useCallback(async () => {
    try {
      // 사용자 정보 로드
      const userRes = await api.getMe();
      if (userRes.data) {
        setUser(transformApiUser(userRes.data));
      }

      // 오늘의 총 시간 로드
      const todaySummaryRes = await api.getTodaySummary();
      if (todaySummaryRes.data) {
        // totalSeconds를 밀리초로 변환 (없으면 totalMinutes 사용)
        const totalMs = todaySummaryRes.data.totalSeconds !== undefined
          ? todaySummaryRes.data.totalSeconds * 1000
          : todaySummaryRes.data.totalMinutes * 60 * 1000;
        setTodayTotalTimeMs(totalMs);
        console.log(`[오늘 총 시간] ${todaySummaryRes.data.date}: ${Math.floor(totalMs / 1000)}초`);
      } else {
        setTodayTotalTimeMs(0);
      }

      // 현재 진행 중인 프로젝트 로드
      const projectsRes = await api.getCurrentProjects();
      if (projectsRes.data && projectsRes.data.data.length > 0) {
        // 각 프로젝트의 상세 정보를 가져와서 tasks 포함
        const projectDetails = await Promise.all(
          projectsRes.data.data.map(async (summary) => {
            const detailRes = await api.getProject(summary.id);
            if (detailRes.data) {
              return transformProjectDetail(detailRes.data);
            }
            return transformProjectSummary(summary);
          })
        );
        setProjects(projectDetails);
      } else {
        // API에서 프로젝트가 없으면 빈 배열 설정
        setProjects([]);
      }
    } catch (error) {
      console.log('API 연결 실패, 샘플 데이터 사용:', error);
      setProjects(sampleProjects);
      setTodayTotalTimeMs(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 타이머 상태 변화 감지 (타이머 정지 시 데이터 새로고침)
  const prevTimerRunningRef = useRef(isTimerRunning);
  useEffect(() => {
    // 타이머가 실행 중 → 정지됨 으로 변할 때만 새로고침
    if (prevTimerRunningRef.current && !isTimerRunning) {
      loadData();
    }
    prevTimerRunningRef.current = isTimerRunning;
  }, [isTimerRunning, loadData]);

  // ScrollView ref for scroll to top on focus
  const scrollViewRef = useRef<ScrollView>(null);

  // 날짜 변경 감지용 refs
  const midnightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRestartRef = useRef<{ projectId: string; taskId: string } | null>(null);
  // 초기값은 컴포넌트 외부에서 계산 (로컬 타임존 기준)
  const getInitialDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  const lastCheckedDateRef = useRef<string>(getInitialDate());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // 날짜 형식: YYYY-MM-DD (로컬 타임존 기준)
  const getLocalDateString = useCallback((date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getTodayDateString = useCallback(() => getLocalDateString(new Date()), [getLocalDateString]);

  // 날짜 변경 확인 및 처리
  const checkAndHandleDateChange = useCallback(async () => {
    const currentDate = getTodayDateString();
    const lastDate = lastCheckedDateRef.current;

    console.log(`[날짜 확인] 현재: ${currentDate}, 마지막: ${lastDate}, 같음: ${currentDate === lastDate}`);

    if (currentDate !== lastDate) {
      console.log(`[날짜 변경] ${lastDate} → ${currentDate}`);
      lastCheckedDateRef.current = currentDate;

      if (isTimerRunning && currentTask && currentProject) {
        // 타이머가 실행 중이면 정지 후 재시작 예약
        console.log('타이머를 정지하고 새 날짜로 재시작합니다.');
        pendingRestartRef.current = {
          projectId: currentProject.id,
          taskId: currentTask.id,
        };
        stopTimer();
      } else {
        // 타이머가 실행 중이 아니면 데이터만 새로고침
        await loadData();
      }
      return true; // 날짜가 변경됨
    }
    return false; // 날짜가 같음
  }, [isTimerRunning, currentTask, currentProject, stopTimer, loadData, getTodayDateString]);

  // 화면 포커스 시 날짜 확인 후 데이터 로드
  useFocusEffect(
    useCallback(() => {
      // 탭 포커스 시 스크롤 맨 위로 이동
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });

      const init = async () => {
        const dateChanged = await checkAndHandleDateChange();
        if (!dateChanged) {
          // 날짜가 같으면 일반 데이터 로드
          loadData();
        }
        // 날짜가 바뀌었으면 checkAndHandleDateChange에서 처리함
      };
      init();
    }, [loadData, checkAndHandleDateChange])
  );

  // 앱 포그라운드 전환 시 날짜 확인
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('앱이 포그라운드로 전환됨, 날짜 확인');
        checkAndHandleDateChange();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [checkAndHandleDateChange]);

  // 자정 타이머: 자정에 날짜 변경 처리
  useEffect(() => {
    const checkMidnight = () => {
      const now = new Date();
      // 다음 자정까지 남은 시간 계산
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const msUntilMidnight = tomorrow.getTime() - now.getTime();

      // 자정에 날짜 변경 처리 예약
      midnightTimerRef.current = setTimeout(async () => {
        console.log('자정 타이머 실행');
        // lastCheckedDateRef를 어제 날짜로 설정하여 날짜 변경 감지 유도
        const yesterday = new Date(Date.now() - 1000);
        lastCheckedDateRef.current = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
        await checkAndHandleDateChange();

        // 다음 자정을 위해 재귀 호출
        checkMidnight();
      }, msUntilMidnight);
    };

    checkMidnight();
    return () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }
    };
  }, [checkAndHandleDateChange]);

  // 자정에 타이머 정지 후 재시작 처리
  useEffect(() => {
    // 타이머가 정지되었고, 재시작 대기 중인 경우
    if (!isTimerRunning && pendingRestartRef.current) {
      const { projectId, taskId } = pendingRestartRef.current;
      pendingRestartRef.current = null;

      // 데이터 새로고침 후 타이머 재시작
      const restartTimer = async () => {
        await loadData();

        // 새로고침 후 프로젝트와 태스크 찾기
        const projectsRes = await api.getCurrentProjects();
        if (projectsRes.data?.data) {
          const project = projectsRes.data.data.find(p => p.id === projectId);
          if (project) {
            const detailRes = await api.getProject(projectId);
            if (detailRes.data) {
              const fullProject = transformProjectDetail(detailRes.data);
              const task = fullProject.tasks.find(t => t.id === taskId);
              if (task && !task.isDone) {
                console.log('새 날짜로 타이머를 재시작합니다.');
                startTimer(taskId, fullProject, task);
              }
            }
          }
        }
      };

      restartTimer();
    }
  }, [isTimerRunning, loadData, startTimer]);

  // 실시간 Task 할당 이벤트 구독
  useEffect(() => {
    if (!user?.id) return;

    const handleTaskAssigned = (payload: TaskAssignedPayload) => {
      console.log('[HomeScreen] Task assigned:', payload);
      // 나에게 할당된 Task 알림 (loadData로 새로고침)
      loadData();
    };

    socketService.onTaskAssigned(handleTaskAssigned);

    return () => {
      socketService.off('task:assigned');
    };
  }, [user?.id, loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    // 새로고침 시에도 날짜 확인
    const dateChanged = await checkAndHandleDateChange();
    if (!dateChanged) {
      await loadData();
    }
    setRefreshing(false);
  };

  // 오늘의 Task 토글
  const handleToggleDailyTask = async (projectId: string, taskId: string) => {
    const task = projects.find(p => p.id === projectId)?.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t),
      };
    }));

    // API 호출
    try {
      await api.updateChecklist(taskId, { isCompleted: !task.isDone });
    } catch (error) {
      // 실패 시 롤백
      console.error('Task 업데이트 실패:', error);
      setProjects(prev => prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: task.isDone } : t),
        };
      }));
    }
  };

  // 타이머 시작 (WebSocket 사용)
  const handleStartDailyTaskTimer = useCallback((task: Task) => {
    const project = projects.find(p => p.id === task.projectId);
    if (!project) return;

    // TimerContext의 startTimer 호출 (WebSocket으로 서버에 요청)
    startTimer(task.id, project, task);
  }, [projects, startTimer]);

  // 타이머 정지 (WebSocket 사용)
  const handleStopTimer = useCallback(() => {
    // TimerContext의 stopTimer 호출 (WebSocket으로 서버에 요청)
    stopTimer();
  }, [stopTimer]);

  // 프로젝트 클릭
  const handleProjectPress = (project: Project) => {
    navigation.navigate('ProjectDetail', { projectId: project.id });
  };

  // 새 프로젝트 생성
  const handleCreateProject = () => {
    setShowCreateProject(true);
  };

  // 프로젝트 생성 완료 후 목록 새로고침
  const handleProjectCreated = () => {
    loadData();
  };

  // 프로필 보기
  const handleShowProfile = () => {
    setShowProfile(true);
  };

  // 사용자 정보 업데이트
  const handleUpdateUser = async (updatedUser: User) => {
    setUser(updatedUser);
    // API로 사용자 정보 업데이트
    try {
      await api.updateMe({
        nickname: updatedUser.nickname,
        profileEmoji: updatedUser.emoji || undefined,
      });
    } catch (error) {
      console.error('사용자 정보 업데이트 실패:', error);
    }
  };

  // 영수증 보기
  const handleShowReceipt = async () => {
    setIsLoadingReceipt(true);
    try {
      const todayStr = getTodayDateString(); // 로컬 타임존 기준
      const res = await api.getReceiptDetails(todayStr);
      if (res.data) {
        // 이미지가 이미 있는 경우 자동으로 새로고침
        if (res.data.imageUrl) {
          await api.generateReceiptImage(todayStr);
          // 새로고침 후 다시 데이터 가져오기
          const refreshedRes = await api.getReceiptDetails(todayStr);
          if (refreshedRes.data) {
            setReceiptData({
              date: refreshedRes.data.date,
              tasks: refreshedRes.data.tasks,
              totalTimeMs: refreshedRes.data.totalTimeMs,
              timeSlots: refreshedRes.data.timeSlots,
              imageUrl: refreshedRes.data.imageUrl,
            });
          }
        } else {
          setReceiptData({
            date: res.data.date,
            tasks: res.data.tasks,
            totalTimeMs: res.data.totalTimeMs,
            timeSlots: res.data.timeSlots,
            imageUrl: res.data.imageUrl,
          });
        }
        setShowReceiptModal(true);
      }
    } catch (error) {
      console.error('영수증 데이터 로드 실패:', error);
      // 로컬 데이터로 영수증 생성
      const todayStr = getTodayDateString(); // 로컬 타임존 기준
      const localTasks = todayTasks.map(task => ({
        taskName: task.content,
        projectName: task.projectTitle || '',
        durationMs: task.durationMs || 0,
      }));
      setReceiptData({
        date: todayStr,
        tasks: localTasks,
        totalTimeMs: todayTotalTimeMs + (isTimerRunning ? elapsedTime : 0),
        timeSlots: new Array(144).fill(false),
        imageUrl: null,
      });
      setShowReceiptModal(true);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  // 영수증 이미지 생성 상태
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  // 영수증 이미지 생성
  const handleGenerateReceiptImage = async () => {
    setIsGeneratingReceipt(true);
    try {
      const todayStr = getTodayDateString(); // 로컬 타임존 기준
      const response = await api.generateReceiptImage(todayStr);
      if (response.data?.imageUrl) {
        // 이미지 URL 업데이트
        setReceiptData(prev => prev ? { ...prev, imageUrl: response.data!.imageUrl } : null);
        Alert.alert('완료', '영수증 이미지가 생성되었습니다!');
      }
    } catch (error) {
      console.error('영수증 생성 실패:', error);
      Alert.alert('오류', '영수증 생성에 실패했습니다.');
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  // 활성화된(보고서 작성 안 된) 프로젝트만 표시
  const activeProjects = projects.filter(p => !p.report);

  // 완료된 오늘의 Task 여부
  const allTodayTasksDone = todayTasks.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header - Momento 스타일 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            <Text style={styles.headerNickname}>{user.nickname}</Text>
            <Text style={styles.headerSuffix}>'s Momento.</Text>
          </Text>
          <TouchableOpacity style={styles.profileButton} onPress={handleShowProfile}>
            <Icon name="account-outline" size={24} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Total Time Display - 오늘의 총 시간 (자정에 리셋) */}
        <TotalTimeDisplay
          timeMs={todayTotalTimeMs + (isTimerRunning ? elapsedTime : 0)}
          isRunning={isTimerRunning}
          currentTask={currentTask}
          onTimerClick={() => isTimerRunning && setShowFocusMode(true)}
        />

        {/* Daily Todo Section - 오늘 할 일 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>오늘 할 일 ({todayTasks.length})</Text>
          </View>
          
          <View style={styles.todoContainer}>
            {allTodayTasksDone ? (
              <View style={styles.emptyTodo}>
                <Icon name="check-circle" size={32} color={COLORS.success} />
                <Text style={styles.emptyTodoText}>
                  오늘 할 일을 모두 완료했습니다!
                </Text>
              </View>
            ) : (
              todayTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => handleToggleDailyTask(task.projectId, task.id)}
                  onStartTimer={() => handleStartDailyTaskTimer(task)}
                  onStopTimer={handleStopTimer}
                  isTimerRunning={isTimerRunning}
                  currentTaskId={currentTask?.id}
                  currentProjectId={currentProject?.id}
                  projectId={task.projectId}
                  elapsedTime={elapsedTime}
                />
              ))
            )}
          </View>
        </View>

        {/* Projects Section - 프로젝트 목록 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>프로젝트 ({activeProjects.length})</Text>
          </View>
          
          <View style={styles.projectList}>
            {activeProjects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onPress={() => handleProjectPress(project)}
                isTimerRunning={isTimerRunning}
                currentProjectId={currentProject?.id}
                elapsedTime={elapsedTime}
              />
            ))}
            
            {/* 새 프로젝트 버튼 */}
            <TouchableOpacity style={styles.newProjectButton} onPress={handleCreateProject}>
              <Icon name="plus" size={18} color={COLORS.textMuted} />
              <Text style={styles.newProjectText}>새 프로젝트</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 영수증 버튼 섹션 */}
        <View style={styles.receiptSection}>
          <TouchableOpacity
            style={[
              styles.receiptButton,
              isLoadingReceipt && styles.receiptButtonDisabled,
            ]}
            onPress={handleShowReceipt}
            disabled={isLoadingReceipt}
          >
            <Text style={styles.receiptButtonText}>
              {isLoadingReceipt ? '로딩 중...' : '오늘의 영수증 보기'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>


      {/* Floating Timer */}
      <FloatingTimer
        isRunning={isTimerRunning}
        elapsedTime={elapsedTime}
        projectTotalTime={currentProject ? currentProject.totalTimeMs + elapsedTime : 0}
        project={currentProject}
        task={currentTask}
        onStop={handleStopTimer}
        onExpand={() => setShowFocusMode(true)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        user={user}
        onUpdateUser={handleUpdateUser}
      />

      {/* Focus Mode Modal */}
      <FocusModeModal
        isOpen={showFocusMode}
        onClose={() => setShowFocusMode(false)}
        project={currentProject}
        task={currentTask}
        elapsedTime={elapsedTime}
        onStop={handleStopTimer}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProject}
        onClose={() => setShowCreateProject(false)}
        onProjectCreated={handleProjectCreated}
        currentUser={user}
      />

      {/* Receipt Modal */}
      <Modal
        visible={showReceiptModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowReceiptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.receiptModalContainer}>
            <View style={styles.receiptModalHeader}>
              <Text style={styles.receiptModalTitle}>오늘의 영수증</Text>
              <TouchableOpacity
                style={styles.receiptCloseButton}
                onPress={() => setShowReceiptModal(false)}
              >
                <Icon name="close" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.receiptScrollView} contentContainerStyle={styles.receiptScrollContent}>
              {receiptData && (
                isGeneratingReceipt ? (
                  // 생성 중
                  <View style={styles.receiptLoadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.gray900} />
                    <Text style={styles.receiptLoadingText}>영수증 생성 중...</Text>
                  </View>
                ) : receiptData.imageUrl ? (
                  // 서버에서 생성된 이미지 표시
                  <Image
                    source={{ uri: `${getImageBaseUrl()}${receiptData.imageUrl}` }}
                    style={styles.receiptImage}
                    resizeMode="contain"
                  />
                ) : (
                  // 이미지가 없으면 ArchiveReceipt 컴포넌트 표시
                  <ArchiveReceipt
                    date={receiptData.date}
                    projectTitle="오늘의 기록"
                    projectColor={COLORS.primary}
                    totalTime={formatTime(receiptData.totalTimeMs)}
                    tasks={receiptData.tasks.map((task, index) => ({
                      id: `task-${index}`,
                      title: task.taskName,
                      duration: Math.floor(task.durationMs / 1000),
                      projectColor: COLORS.primary,
                    }))}
                  />
                )
              )}
            </ScrollView>

            <View style={styles.receiptModalFooter}>
              {receiptData?.imageUrl ? (
                // 이미지가 있으면 아카이빙 버튼 (클릭 시 자동 리로드)
                <TouchableOpacity
                  style={styles.saveReceiptButton}
                  onPress={async () => {
                    setIsGeneratingReceipt(true);
                    try {
                      const todayStr = getTodayDateString();
                      await api.generateReceiptImage(todayStr);
                      // 새로고침 후 다시 데이터 가져오기
                      const refreshedRes = await api.getReceiptDetails(todayStr);
                      if (refreshedRes.data) {
                        setReceiptData({
                          date: refreshedRes.data.date,
                          tasks: refreshedRes.data.tasks,
                          totalTimeMs: refreshedRes.data.totalTimeMs,
                          timeSlots: refreshedRes.data.timeSlots,
                          imageUrl: refreshedRes.data.imageUrl,
                        });
                      }
                      Alert.alert('완료', '영수증이 아카이빙되었습니다!');
                    } catch (error) {
                      console.error('영수증 아카이빙 실패:', error);
                      Alert.alert('오류', '영수증 아카이빙에 실패했습니다.');
                    } finally {
                      setIsGeneratingReceipt(false);
                    }
                  }}
                  disabled={isGeneratingReceipt}
                >
                  <Icon name="archive" size={20} color={COLORS.surface} />
                  <Text style={styles.saveReceiptButtonText}>영수증 아카이빙</Text>
                </TouchableOpacity>
              ) : (
                // 이미지가 없으면 생성 버튼
                <TouchableOpacity
                  style={styles.saveReceiptButton}
                  onPress={handleGenerateReceiptImage}
                  disabled={isGeneratingReceipt || receiptData?.totalTimeMs === 0}
                >
                  <Icon name="image-plus" size={20} color={COLORS.surface} />
                  <Text style={styles.saveReceiptButtonText}>영수증 이미지 생성</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: SPACING.base,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
  },
  headerNickname: {
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  headerSuffix: {
    fontWeight: FONT_WEIGHTS.light,
    color: COLORS.textPrimary,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Sections
  section: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  // Todo container
  todoContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
    borderWidth: 1,
    borderColor: COLORS.gray300,
  },
  emptyTodo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTodoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  // Project list
  projectList: {
    gap: SPACING.sm,
  },
  newProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  newProjectText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  // Receipt section
  receiptSection: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.lg,
  },
  receiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  receiptButtonDisabled: {
    opacity: 0.5,
  },
  receiptButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.surface,
  },
  // Receipt Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptModalContainer: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    overflow: 'hidden',
  },
  receiptModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  receiptModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  receiptCloseButton: {
    padding: SPACING.xs,
  },
  receiptScrollView: {
    maxHeight: 500,
  },
  receiptScrollContent: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  receiptImage: {
    width: '100%',
    height: 600,
    borderRadius: BORDER_RADIUS.md,
  },
  receiptLoadingContainer: {
    flex: 1,
    minHeight: 400,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  receiptLoadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  receiptModalFooter: {
    padding: SPACING.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  saveReceiptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.sm,
  },
  saveReceiptButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.surface,
  },
});

export default HomeScreen;
