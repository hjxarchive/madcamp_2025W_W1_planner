import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { CircularProgress } from '@components/CircularProgress';
import { MemberCard } from '@components/MemberCard';
import { TaskItem } from '@components/TaskItem';
import { FloatingTimer } from '@components/FloatingTimer';
import { WriteReportModal } from '@components/WriteReportModal';
import { AddTaskModal } from '@components/AddTaskModal';
import { api } from '@services/api';
import { COLORS, FONT_SIZES, FONTS, SPACING, BORDER_RADIUS, formatTime, formatDate } from '@constants/index';
import type { Project, Task, Member } from '../types';
import { transformProjectDetail } from '../types';
import { useTimer } from '@contexts/TimerContext';

// ========================
// Personal Project Page
// ========================
interface PersonalProjectPageProps {
  project: Project;
  onBack: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteProject: () => void;
  onStartTaskTimer: (task: Task) => void;
  onAddTask: () => void;
  isTimerRunning: boolean;
  currentTaskId: string | null;
  currentProjectId: string | null;
  elapsedTime: number;
  onWriteReport: () => void;
  onStopTimer: () => void;
  currentTask: Task | null;
}

const PersonalProjectPage: React.FC<PersonalProjectPageProps> = ({
  project,
  onBack,
  onToggleTask,
  onDeleteTask,
  onDeleteProject,
  onStartTaskTimer,
  onAddTask,
  isTimerRunning,
  currentTaskId,
  currentProjectId,
  elapsedTime,
  onWriteReport,
  onStopTimer,
  currentTask,
}) => {
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const progress = project.tasks.length > 0 
    ? Math.round((completedTasks / project.tasks.length) * 100) 
    : 0;
  const isCompleted = progress === 100;
  
  // 이 프로젝트의 현재 실행 중인 Task인지 확인
  const currentTaskInProject = project.id === currentProjectId && 
    project.tasks.find(t => t.id === currentTaskId);
  const displayTotalTime = currentTaskInProject && isTimerRunning 
    ? project.totalTimeMs + elapsedTime 
    : project.totalTimeMs;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{project.title}</Text>
          <View style={styles.headerTimeRow}>
            {currentTaskInProject && isTimerRunning && (
              <View style={styles.animatedDots}>
                <View style={[styles.dot, styles.dotOrange]} />
                <View style={[styles.dot, styles.dotYellow]} />
                <View style={[styles.dot, styles.dotOrangeLight]} />
              </View>
            )}
            <Text style={[
              styles.headerTime,
              currentTaskInProject && isTimerRunning && styles.headerTimeActive
            ]}>
              {formatTime(displayTotalTime)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onDeleteProject} style={styles.deleteProjectButton}>
          <Icon name="trash-can-outline" size={22} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Due Date */}
        {project.dueDate && (
          <View style={styles.dueDateContainer}>
            <Text style={styles.dueDateText}>
              Due date: ~ {formatDate(project.dueDate)}
            </Text>
          </View>
        )}

        {/* Circular Progress */}
        <View style={styles.progressContainer}>
          <CircularProgress
            progress={progress}
            completedTasks={completedTasks}
            totalTasks={project.tasks.length}
          />
        </View>

        {/* Task Section */}
        <View style={styles.taskSection}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskHeaderText}>
              Task ({completedTasks}/{project.tasks.length})
            </Text>
          </View>
          
          <View style={styles.taskList}>
            {project.tasks.length > 0 ? (
              project.tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  onStartTimer={() => onStartTaskTimer(task)}
                  onStopTimer={onStopTimer}
                  isTimerRunning={isTimerRunning}
                  currentTaskId={currentTaskId || undefined}
                  currentProjectId={currentProjectId || undefined}
                  projectId={project.id}
                  elapsedTime={elapsedTime}
                />
              ))
            ) : (
              <Text style={styles.emptyTaskText}>Task가 없습니다</Text>
            )}

            {/* Add Task Button */}
            <TouchableOpacity style={styles.addTaskButton} onPress={onAddTask}>
              <Icon name="plus" size={16} color={COLORS.textMuted} />
              <Text style={styles.addTaskText}>Task 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Write Report Button */}
        {isCompleted && !project.report && (
          <View style={styles.reportButtonContainer}>
            <TouchableOpacity style={styles.reportButton} onPress={onWriteReport}>
              <Icon name="file-document-outline" size={18} color="#fff" />
              <Text style={styles.reportButtonText}>보고서 작성하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Timer */}
      <FloatingTimer
        isRunning={isTimerRunning}
        elapsedTime={elapsedTime}
        projectTotalTime={displayTotalTime}
        project={currentTaskInProject ? project : null}
        task={currentTask}
        onStop={onStopTimer}
        onExpand={() => {}}
      />
    </SafeAreaView>
  );
};

// ========================
// Team Project Page
// ========================
interface MemberTimerState {
  userId: string;
  userName: string;
  checklistContent: string;
  startedAt: string;
}

interface TeamProjectPageProps {
  project: Project;
  onBack: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteProject: () => void;
  onStartTaskTimer: (task: Task) => void;
  onAddTask: () => void;
  isTimerRunning: boolean;
  currentTaskId: string | null;
  currentProjectId: string | null;
  elapsedTime: number;
  onWriteReport: () => void;
  onStopTimer: () => void;
  currentTask: Task | null;
  memberTimers: Record<string, MemberTimerState[]>;
}

const TeamProjectPage: React.FC<TeamProjectPageProps> = ({
  project,
  onBack,
  onToggleTask,
  onDeleteTask,
  onDeleteProject,
  onStartTaskTimer,
  onAddTask,
  isTimerRunning,
  currentTaskId,
  currentProjectId,
  elapsedTime,
  onWriteReport,
  onStopTimer,
  currentTask,
  memberTimers,
}) => {
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const progress = project.tasks.length > 0
    ? Math.round((completedTasks / project.tasks.length) * 100)
    : 0;
  const isCompleted = progress === 100;

  // 이 프로젝트의 현재 실행 중인 Task인지 확인 (본인)
  const currentTaskInProject = project.id === currentProjectId &&
    project.tasks.find(t => t.id === currentTaskId);
  const displayTotalTime = currentTaskInProject && isTimerRunning
    ? project.totalTimeMs + elapsedTime
    : project.totalTimeMs;

  // 본인의 활성 상태 (본인이 타이머 실행 중)
  const isMyTimerActive = !!(currentTaskInProject && isTimerRunning);

  // 프로젝트 내 활성 타이머가 있는지 (본인 또는 팀원)
  const projectMemberTimers = memberTimers[project.id] || [];
  const hasAnyActiveTimer = isMyTimerActive || projectMemberTimers.length > 0;

  // 현재 실행 중인 Task의 할당자 찾기 (본인 타이머용)
  const myActiveMemberId = currentTaskInProject ? currentTaskInProject.assigneeId : undefined;

  // 멤버별 활성 상태 확인 함수
  const isMemberActive = (memberId: string) => {
    // 본인이 활성화한 타이머인지 확인
    if (isMyTimerActive && myActiveMemberId === memberId) {
      return true;
    }
    // 팀원이 활성화한 타이머인지 확인
    return projectMemberTimers.some(t => t.userId === memberId);
  };

  // 팀원의 타이머 정보 가져오기
  const getMemberTimerInfo = (memberId: string): MemberTimerState | undefined => {
    return projectMemberTimers.find(t => t.userId === memberId);
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        hasAnyActiveTimer && styles.containerActiveTeam
      ]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, hasAnyActiveTimer && styles.headerActiveTeam]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{project.title}</Text>
          <View style={styles.headerTimeRow}>
            {hasAnyActiveTimer && (
              <View style={styles.animatedDots}>
                <View style={[styles.dot, styles.dotOrange]} />
                <View style={[styles.dot, styles.dotYellow]} />
                <View style={[styles.dot, styles.dotOrangeLight]} />
              </View>
            )}
            <Text style={[styles.headerTime, hasAnyActiveTimer && styles.headerTimeActiveTeam]}>
              {formatTime(displayTotalTime)}
            </Text>
          </View>
        </View>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.addMemberButton}>
            <Text style={styles.addMemberText}>+ 팀원</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDeleteProject} style={styles.deleteProjectButton}>
            <Icon name="trash-can-outline" size={22} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Team Info */}
        <View style={styles.teamInfoContainer}>
          <Text style={styles.teamLabel}>Team:</Text>
          <Icon name="account-multiple" size={16} color={COLORS.textSecondary} />
          <Text style={styles.teamCount}>
            {project.members?.length || project.memberCount}명
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.teamProgressContainer}>
          <View style={styles.teamProgressHeader}>
            <Text style={styles.teamProgressLabel}>전체 진행률</Text>
            <Text style={styles.teamProgressValue}>{progress}%</Text>
          </View>
          <View style={styles.teamProgressBarBg}>
            <View style={[styles.teamProgressBar, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Member Cards */}
        <View style={styles.memberCardsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberCardsContent}
          >
            {project.members?.map(member => {
              const memberIsActive = isMemberActive(member.id);
              const memberTimerInfo = getMemberTimerInfo(member.id);
              // 본인의 활성 타이머인지, 팀원의 활성 타이머인지 확인
              const isMyActiveTimer = isMyTimerActive && myActiveMemberId === member.id;

              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  project={project}
                  currentTask={isMyActiveTimer ? (currentTaskInProject || null) : null}
                  elapsedTime={isMyActiveTimer ? elapsedTime : 0}
                  isActive={memberIsActive}
                  memberTimerInfo={memberTimerInfo}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Task Section */}
        <View style={styles.taskSection}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskHeaderText}>
              Task ({completedTasks}/{project.tasks.length})
            </Text>
          </View>
          
          <View style={[styles.taskList, hasAnyActiveTimer && styles.taskListActive]}>
            {project.tasks.length > 0 ? (
              project.tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={() => onToggleTask(task.id)}
                  onDelete={() => onDeleteTask(task.id)}
                  onStartTimer={() => onStartTaskTimer(task)}
                  onStopTimer={onStopTimer}
                  isTimerRunning={isTimerRunning}
                  currentTaskId={currentTaskId || undefined}
                  currentProjectId={currentProjectId || undefined}
                  projectId={project.id}
                  elapsedTime={elapsedTime}
                  showAssignee={true}
                  isTeamProject={true}
                />
              ))
            ) : (
              <Text style={styles.emptyTaskText}>Task가 없습니다</Text>
            )}
            
            {/* Add Task Button */}
            <TouchableOpacity style={styles.addTaskButton} onPress={onAddTask}>
              <Icon name="plus" size={16} color={COLORS.textMuted} />
              <Text style={styles.addTaskText}>Task 추가</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Write Report Button */}
        {isCompleted && !project.report && (
          <View style={styles.reportButtonContainer}>
            <TouchableOpacity style={styles.reportButton} onPress={onWriteReport}>
              <Icon name="file-document-outline" size={18} color="#fff" />
              <Text style={styles.reportButtonText}>보고서 작성하기</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Timer */}
      <FloatingTimer
        isRunning={isTimerRunning}
        elapsedTime={elapsedTime}
        projectTotalTime={displayTotalTime}
        project={currentTaskInProject ? project : null}
        task={currentTask}
        onStop={onStopTimer}
        onExpand={() => {}}
      />
    </SafeAreaView>
  );
};

// ========================
// Main ProjectDetailScreen
// ========================
interface ProjectDetailScreenProps {
  route?: RouteProp<any, any>;
}

export const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const routeParams = route?.params as { projectId?: string; project?: Project } | undefined;

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Timer from context
  const {
    isTimerRunning,
    elapsedTime,
    currentProject,
    currentTask,
    startTimer,
    stopTimer,
    joinProjectRoom,
    leaveProjectRoom,
    memberTimers,
  } = useTimer();

  // 현재 타이머가 이 프로젝트에서 실행 중인지 확인
  const currentTaskId = currentTask?.id || null;
  const currentProjectId = currentProject?.id || null;

  // Modal states
  const [showWriteReport, setShowWriteReport] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);

  // Load project from API
  const loadProject = useCallback(async (projectId: string) => {
    try {
      const res = await api.getProject(projectId);
      if (res.data) {
        setProject(transformProjectDetail(res.data));
      }
    } catch (error) {
      console.error('프로젝트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load project
  useEffect(() => {
    if (routeParams?.projectId) {
      loadProject(routeParams.projectId);
    } else {
      setIsLoading(false);
    }
  }, [routeParams, loadProject]);

  // 팀 프로젝트일 경우 프로젝트 룸에 조인/떠남
  useEffect(() => {
    if (project && project.memberCount > 1) {
      joinProjectRoom(project.id);
      return () => {
        leaveProjectRoom(project.id);
      };
    }
  }, [project, joinProjectRoom, leaveProjectRoom]);

  // 타이머 상태 변화 감지 (타이머 정지 시 데이터 새로고침)
  const prevTimerRunningRef = React.useRef(isTimerRunning);
  const projectIdRef = React.useRef<string | null>(null);
  projectIdRef.current = project?.id ?? null;

  useEffect(() => {
    // 타이머가 실행 중 → 정지됨 으로 변할 때만 새로고침
    if (prevTimerRunningRef.current && !isTimerRunning && projectIdRef.current) {
      loadProject(projectIdRef.current);
    }
    prevTimerRunningRef.current = isTimerRunning;
  }, [isTimerRunning, loadProject]);

  // Handlers
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleToggleTask = useCallback(async (taskId: string) => {
    if (!project) return;
    
    const task = project.tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistic update
    setProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        tasks: prev.tasks.map(t => 
          t.id === taskId ? { ...t, isDone: !t.isDone } : t
        ),
      };
    });

    // API 호출
    try {
      await api.updateChecklist(taskId, { isCompleted: !task.isDone });
    } catch (error) {
      console.error('Task 업데이트 실패:', error);
      // 실패 시 롤백
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          tasks: prev.tasks.map(t => 
            t.id === taskId ? { ...t, isDone: task.isDone } : t
          ),
        };
      });
    }
  }, [project]);

  // 타이머 시작 (WebSocket 사용)
  const handleStartTaskTimer = useCallback((task: Task) => {
    if (!project) return;

    // TimerContext의 startTimer 호출 (WebSocket으로 서버에 요청)
    startTimer(task.id, project, task);
  }, [project, startTimer]);

  // 타이머 정지 (WebSocket 사용)
  const handleStopTimer = useCallback(() => {
    // TimerContext의 stopTimer 호출 (WebSocket으로 서버에 요청)
    stopTimer();
  }, [stopTimer]);

  const handleAddTask = useCallback(() => {
    setShowAddTask(true);
  }, []);

  const handleAddTaskSubmit = useCallback(async (taskData: { content: string; assigneeId?: string; assigneeName?: string }) => {
    if (!project) return;

    try {
      const res = await api.createChecklist(project.id, {
        content: taskData.content,
        assigneeId: taskData.assigneeId,
      });
      if (res.data) {
        // 프로젝트 다시 로드 대신 새 Task만 로컬에 추가 (기존 시간 기록 유지)
        const newTask: Task = {
          id: res.data.id,
          content: res.data.content,
          isDone: res.data.isCompleted,
          durationMs: res.data.totalTimeMinutes * 60 * 1000,
          projectId: project.id,
          projectTitle: project.title,
          assigneeId: res.data.assigneeId,
          assigneeName: res.data.assigneeNickname,
          displayOrder: res.data.displayOrder,
        };
        setProject(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            tasks: [...prev.tasks, newTask],
          };
        });
      } else if (res.error) {
        Alert.alert('오류', res.error);
      }
    } catch (error) {
      console.error('Task 추가 실패:', error);
      Alert.alert('오류', 'Task 추가에 실패했습니다.');
    }
  }, [project]);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    if (!project) return;

    // 타이머가 실행 중인 Task인지 확인
    if (isTimerRunning && currentTaskId === taskId) {
      Alert.alert('알림', '타이머가 실행 중입니다. 먼저 타이머를 정지해주세요.');
      return;
    }

    Alert.alert(
      'Task 삭제',
      '이 Task를 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            // Optimistic update
            setProject(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                tasks: prev.tasks.filter(t => t.id !== taskId),
              };
            });

            try {
              await api.deleteChecklist(taskId);
            } catch (error) {
              console.error('Task 삭제 실패:', error);
              // 실패 시 프로젝트 다시 로드
              loadProject(project.id);
              Alert.alert('오류', 'Task 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  }, [project, loadProject, isTimerRunning, currentTaskId]);

  const handleDeleteProject = useCallback(() => {
    if (!project) return;

    // 이 프로젝트에서 타이머가 실행 중인지 확인
    if (isTimerRunning && currentProjectId === project.id) {
      Alert.alert('알림', '타이머가 실행 중입니다. 먼저 타이머를 정지해주세요.');
      return;
    }

    Alert.alert(
      '프로젝트 삭제',
      `"${project.title}" 프로젝트를 삭제하시겠습니까?\n모든 Task와 기록이 함께 삭제됩니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteProject(project.id);
              navigation.goBack();
            } catch (error) {
              console.error('프로젝트 삭제 실패:', error);
              Alert.alert('오류', '프로젝트 삭제에 실패했습니다.');
            }
          },
        },
      ]
    );
  }, [project, navigation, isTimerRunning, currentProjectId]);

  const handleWriteReport = useCallback(() => {
    setShowWriteReport(true);
  }, []);

  const handleSaveReport = useCallback(async (reportData: { rating: number }) => {
    if (!project) return;

    try {
      const res = await api.completeProject(project.id, { rating: reportData.rating });
      if (res.data) {
        // 프로젝트를 다시 로드하여 최신 상태 반영
        await loadProject(project.id);
        // 보고서 저장 후 메인 페이지로 이동
        navigation.goBack();
      }
    } catch (error) {
      console.error('보고서 저장 실패:', error);
      Alert.alert('오류', '보고서 저장에 실패했습니다.');
    }
  }, [project, navigation, loadProject]);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>프로젝트를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // memberCount가 1보다 크면 Team Project
  const isTeamProject = project.memberCount > 1;

  const commonProps = {
    project,
    onBack: handleBack,
    onToggleTask: handleToggleTask,
    onDeleteTask: handleDeleteTask,
    onDeleteProject: handleDeleteProject,
    onStartTaskTimer: handleStartTaskTimer,
    onAddTask: handleAddTask,
    isTimerRunning,
    currentTaskId,
    currentProjectId,
    elapsedTime,
    onWriteReport: handleWriteReport,
    onStopTimer: handleStopTimer,
    currentTask,
    memberTimers,
  };

  return (
    <View style={{ flex: 1 }}>
      {isTeamProject ? (
        <TeamProjectPage {...commonProps} />
      ) : (
        <PersonalProjectPage {...commonProps} />
      )}
      
      {/* Write Report Modal */}
      <WriteReportModal
        isOpen={showWriteReport}
        onClose={() => setShowWriteReport(false)}
        project={project}
        onSave={handleSaveReport}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onAdd={handleAddTaskSubmit}
        members={project.members}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  containerActiveTeam: {
    backgroundColor: '#FFFBEB', // amber-50 gradient 대체
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerActiveTeam: {
    borderBottomColor: '#FDBA74', // orange-300
    backgroundColor: '#FFF7ED', // orange-50
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  headerTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  headerTime: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
  },
  headerTimeActive: {
    color: COLORS.primary,
    fontWeight: '600',
    fontFamily: FONTS.mono,
  },
  headerTimeActiveTeam: {
    color: '#EA580C', // orange-600
    fontWeight: '700',
    fontFamily: FONTS.mono,
  },
  headerRight: {
    width: 40,
  },
  animatedDots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOrange: {
    backgroundColor: '#F97316', // orange-500
  },
  dotYellow: {
    backgroundColor: '#FACC15', // yellow-400
  },
  dotOrangeLight: {
    backgroundColor: '#FB923C', // orange-400
  },
  addMemberButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.sm,
  },
  addMemberText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  deleteProjectButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Due Date
  dueDateContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  dueDateText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Progress
  progressContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  // Team Info
  teamInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    gap: 6,
  },
  teamLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  teamCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  // Team Progress
  teamProgressContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  teamProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  teamProgressLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  teamProgressValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  teamProgressBarBg: {
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  teamProgressBar: {
    height: '100%',
    backgroundColor: COLORS.gray800,
    borderRadius: 4,
  },
  // Member Cards
  memberCardsContainer: {
    paddingVertical: SPACING.base,
  },
  memberCardsContent: {
    paddingHorizontal: SPACING.base,
    gap: SPACING.md,
  },
  // Task Section
  taskSection: {
    paddingHorizontal: SPACING.base,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskHeaderText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  taskList: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.base,
  },
  taskListActive: {
    borderWidth: 2,
    borderColor: '#FDBA74', // orange-300
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTaskText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.base,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    marginTop: SPACING.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.md,
    gap: 6,
  },
  addTaskText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  // Report Button
  reportButtonContainer: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  reportButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: '#fff',
  },
});

export default ProjectDetailScreen;
