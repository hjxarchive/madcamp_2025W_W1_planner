import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { TotalTimeDisplay, TaskItem, ProjectCard, FloatingTimer, ProfileModal, FocusModeModal } from '@components/index';
import { api } from '@services/api';
import { COLORS, FONT_SIZES, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS, formatTime, formatTimeShort } from '@constants/index';
import type { RootStackParamList } from '@navigation/RootNavigator';

// Types
interface Task {
  id: string;
  content: string;
  isDone: boolean;
  durationMs: number;
  projectId: string;
  projectTitle?: string;
  assigneeId?: string;
  assigneeName?: string;
}

interface Project {
  id: string;
  title: string;
  totalTimeMs: number;
  dueDate?: Date | null;
  memberCount: number;
  tasks: Task[];
  members?: { id: string; nickname: string; timeMs: number; progress: number }[];
  report?: any;
}

interface User {
  id: string;
  nickname: string;
  emoji?: string;
}

// Sample data (웹앱과 동일)
const initialUser: User = {
  id: 'user-1',
  nickname: 'Hanjin',
  emoji: '🦊',
};

const initialProjects: Project[] = [
  {
    id: 'proj-1',
    title: '해석학 공부',
    totalTimeMs: 7200000,
    dueDate: new Date('2026-01-15'),
    memberCount: 1,
    tasks: [
      { id: 't1', content: '수업 복습하기', isDone: true, durationMs: 3600000, projectId: 'proj-1' },
      { id: 't2', content: '연습문제 풀기', isDone: false, durationMs: 1800000, projectId: 'proj-1' },
      { id: 't3', content: '개념 정리 노트', isDone: false, durationMs: 1800000, projectId: 'proj-1' },
    ],
  },
  {
    id: 'proj-2',
    title: '팀 프로젝트 A',
    totalTimeMs: 14400000,
    dueDate: new Date('2026-01-20'),
    memberCount: 3,
    members: [
      { id: 'm1', nickname: 'Hanjin', timeMs: 5400000, progress: 45 },
      { id: 'm2', nickname: 'Alice', timeMs: 4500000, progress: 40 },
      { id: 'm3', nickname: 'Bob', timeMs: 4500000, progress: 35 },
    ],
    tasks: [
      { id: 't4', content: '디자인 시안 작성', isDone: true, durationMs: 5400000, projectId: 'proj-2', assigneeId: 'm1', assigneeName: 'Hanjin' },
      { id: 't5', content: 'API 개발', isDone: false, durationMs: 4500000, projectId: 'proj-2', assigneeId: 'm2', assigneeName: 'Alice' },
      { id: 't6', content: '문서 작성', isDone: false, durationMs: 4500000, projectId: 'proj-2', assigneeId: 'm3', assigneeName: 'Bob' },
    ],
  },
];

// 오늘의 Task 가져오기 (모든 프로젝트에서)
const getTodayTasks = (projects: Project[], user: User): Task[] => {
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

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User>(initialUser);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  // Profile modal state
  const [showProfile, setShowProfile] = useState(false);

  // Focus mode state
  const [showFocusMode, setShowFocusMode] = useState(false);

  // 전체 시간 계산
  const totalTimeMs = projects.reduce((sum, p) => sum + p.totalTimeMs, 0);
  
  // 오늘의 Task
  const todayTasks = getTodayTasks(projects, user);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const loadData = useCallback(async () => {
    try {
      // API에서 데이터 로드 시도
      const projectsRes = await api.getProjects();
      if (projectsRes.data && projectsRes.data.length > 0) {
        // setProjects(projectsRes.data);
      }
    } catch (error) {
      console.log('Using sample data');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // 오늘의 Task 토글
  const handleToggleDailyTask = (projectId: string, taskId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        tasks: p.tasks.map(t => t.id === taskId ? { ...t, isDone: !t.isDone } : t),
      };
    }));
  };

  // 타이머 시작
  const handleStartDailyTaskTimer = (task: Task) => {
    const project = projects.find(p => p.id === task.projectId);
    if (!project) return;
    
    setCurrentProject(project);
    setCurrentTask(task);
    setElapsedTime(0);
    setIsTimerRunning(true);
  };

  // 타이머 정지
  const handleStopTimer = () => {
    if (currentProject && currentTask && elapsedTime > 0) {
      setProjects(prev => prev.map(p => {
        if (p.id !== currentProject.id) return p;
        const updatedTasks = p.tasks.map(t =>
          t.id !== currentTask.id ? t : { ...t, durationMs: (t.durationMs || 0) + elapsedTime }
        );
        return { ...p, tasks: updatedTasks, totalTimeMs: p.totalTimeMs + elapsedTime };
      }));
    }
    setIsTimerRunning(false);
    setElapsedTime(0);
    setCurrentProject(null);
    setCurrentTask(null);
  };

  // 프로젝트 클릭
  const handleProjectPress = (project: Project) => {
    navigation.navigate('ProjectDetail', { project });
  };

  // 새 프로젝트 생성
  const handleCreateProject = () => {
    // TODO: Open create project modal
    console.log('Create project');
  };

  // 프로필 보기
  const handleShowProfile = () => {
    setShowProfile(true);
  };

  // 사용자 정보 업데이트
  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
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
      </ScrollView>


      {/* Floating Timer */}
      <FloatingTimer
        isRunning={isTimerRunning}
        elapsedTime={elapsedTime}
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
    fontWeight: FONT_WEIGHTS.normal,
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
});

export default HomeScreen;
