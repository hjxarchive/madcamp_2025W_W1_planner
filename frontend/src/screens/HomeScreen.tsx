import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { TotalTimeDisplay, TaskItem, ProjectCard, FloatingTimer, ProfileModal, FocusModeModal, CreateProjectModal, ArchiveReceipt } from '@components/index';
import { api } from '@services/api';
import { COLORS, FONT_SIZES, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS, formatTime, formatTimeShort } from '@constants/index';
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
const getTodayTasks = (projects: Project[]): Task[] => {
  const tasks: Task[] = [];
  projects.forEach(project => {
    if (!project.report) {
      project.tasks.forEach(task => {
        if (!task.isDone) {
          tasks.push({ ...task, projectTitle: project.title, projectId: project.id });
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
}

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
    setOnTimerStopped,
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

  // 전체 시간 계산
  const totalTimeMs = projects.reduce((sum, p) => sum + p.totalTimeMs, 0);

  // 오늘의 Task
  const todayTasks = getTodayTasks(projects);

  const loadData = useCallback(async () => {
    try {
      // 사용자 정보 로드
      const userRes = await api.getMe();
      if (userRes.data) {
        setUser(transformApiUser(userRes.data));
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
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 타이머 정지 시 데이터 새로고침
  useEffect(() => {
    const handleTimerStopped = (_durationMs: number) => {
      // 서버에서 최신 데이터 다시 로드 (초 단위 정밀도 보장)
      loadData();
    };

    setOnTimerStopped(handleTimerStopped);

    return () => {
      setOnTimerStopped(null);
    };
  }, [setOnTimerStopped, loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
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
      const today = new Date().toISOString().split('T')[0];
      const res = await api.getReceiptDetails(today);
      if (res.data) {
        setReceiptData({
          date: res.data.date,
          tasks: res.data.tasks,
          totalTimeMs: res.data.totalTimeMs,
          timeSlots: res.data.timeSlots,
        });
        setShowReceiptModal(true);
      }
    } catch (error) {
      console.error('영수증 데이터 로드 실패:', error);
      // 로컬 데이터로 영수증 생성
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const localTasks = todayTasks.map(task => ({
        taskName: task.content,
        projectName: task.projectTitle || '',
        durationMs: task.durationMs || 0,
      }));
      setReceiptData({
        date: dateStr,
        tasks: localTasks,
        totalTimeMs: totalTimeMs + (isTimerRunning ? elapsedTime : 0),
        timeSlots: new Array(144).fill(false),
      });
      setShowReceiptModal(true);
    } finally {
      setIsLoadingReceipt(false);
    }
  };

  // 영수증 이미지 저장 (생성 요청)
  const handleSaveReceiptImage = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      await api.generateReceiptImage(today);
      Alert.alert('완료', '영수증이 저장되었습니다!');
      setShowReceiptModal(false);
    } catch (error) {
      console.error('영수증 저장 실패:', error);
      Alert.alert('오류', '영수증 저장에 실패했습니다.');
    }
  };

  // 활성화된(보고서 작성 안 된) 프로젝트만 표시
  const activeProjects = projects.filter(p => !p.report);

  // 완료된 오늘의 Task 여부
  const allTodayTasksDone = todayTasks.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
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

        {/* Total Time Display - 원형 타이머 */}
        <TotalTimeDisplay
          timeMs={totalTimeMs + (isTimerRunning ? elapsedTime : 0)}
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
            <Icon name="receipt" size={20} color={COLORS.surface} />
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

            <ScrollView style={styles.receiptScrollView}>
              {receiptData && (
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
              )}
            </ScrollView>

            <View style={styles.receiptModalFooter}>
              <TouchableOpacity
                style={styles.saveReceiptButton}
                onPress={handleSaveReceiptImage}
              >
                <Icon name="download" size={20} color={COLORS.surface} />
                <Text style={styles.saveReceiptButtonText}>영수증 저장</Text>
              </TouchableOpacity>
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
    paddingBottom: 180,
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
