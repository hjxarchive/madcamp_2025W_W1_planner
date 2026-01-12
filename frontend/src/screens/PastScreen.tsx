import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, FONT_WEIGHTS, FONTS, SPACING, BORDER_RADIUS, formatTime, formatTimeShort } from '@constants/index';
import { api } from '@services/api';
import { ReportDonutChart } from '@components/index';
import type { Project, Task } from '../types';
import { transformProjectSummary, transformProjectDetail } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Task 정보 모달 (도넛 차트 세그먼트 클릭 시)
const TaskInfoModal: React.FC<{
  task: Task | null;
  onClose: () => void;
  memberCount?: number;
}> = ({ task, onClose, memberCount = 1 }) => {
  if (!task) return null;

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.taskModalContainer}>
          <View style={styles.taskModalHeader}>
            <Text style={styles.taskModalTitle}>Task 정보</Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close" size={24} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          <View style={styles.taskModalContent}>
            <View style={styles.taskInfoRow}>
              <Text style={styles.taskInfoLabel}>Task 명</Text>
              <Text style={styles.taskInfoValue}>{task.content}</Text>
            </View>

            <View style={styles.taskInfoRow}>
              <Text style={styles.taskInfoLabel}>소요 시간</Text>
              <Text style={styles.taskInfoTime}>{formatTime(task.durationMs || 0)}</Text>
            </View>

            {task.assigneeName && (
              <View style={styles.taskInfoRow}>
                <Text style={styles.taskInfoLabel}>참여인원</Text>
                <View style={styles.assigneeRow}>
                  <Icon name="account" size={18} color={COLORS.gray600} />
                  <Text style={styles.taskInfoValue}>{task.assigneeName}</Text>
                </View>
              </View>
            )}

            {memberCount > 1 && !task.assigneeName && (
              <View style={styles.taskInfoRow}>
                <Text style={styles.taskInfoLabel}>참여인원</Text>
                <Text style={styles.taskInfoMuted}>할당되지 않음</Text>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.taskModalCloseButton} onPress={onClose}>
            <Text style={styles.taskModalCloseText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Report Detail View - WriteReportModal과 동일한 디자인
const ReportDetailView: React.FC<{
  project: Project;
  onBack: () => void;
}> = ({ project, onBack }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  if (!project.report) return null;

  // 완료된 프로젝트는 모든 Task가 isDone=true가 됨 (백엔드 로직)
  // 따라서 모든 Task를 표시하고, 시간 기록 여부로 실제 진행 여부 판단
  const allTasks = project.tasks;
  const completedTasks = allTasks.filter(t => t.isDone);
  const tasksWithTime = allTasks.filter(t => t.durationMs > 0);

  // 디버깅: 데이터 확인
  console.log('ReportDetailView - allTasks:', allTasks.length);
  console.log('ReportDetailView - tasksWithTime:', tasksWithTime.length, tasksWithTime.map(t => ({ content: t.content, durationMs: t.durationMs })));

  // 도넛 차트용: 실제 시간이 기록된 Task만 표시
  const chartTotalTimeMs = tasksWithTime.reduce((sum, t) => sum + t.durationMs, 0);
  console.log('ReportDetailView - chartTotalTimeMs:', chartTotalTimeMs);

  // 표시용 총 시간: 차트 총 시간 또는 프로젝트 총 시간
  const displayTotalTimeMs = chartTotalTimeMs > 0 ? chartTotalTimeMs : project.totalTimeMs;

  // 진행한 Task 목록: 시간 기록이 있는 Task 또는 isDone인 Task
  const displayTasks = tasksWithTime.length > 0 ? tasksWithTime : completedTasks;

  const handleSegmentClick = (task: any) => {
    setSelectedTask(task as Task);
  };

  return (
    <View style={styles.detailContainer}>
      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack}>
          <Icon name="chevron-left" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>보고서</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
        {/* Project Info - 프로젝트명 + 총 소요시간 */}
        <View style={styles.projectInfoSection}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.totalTimeLabel}>총 소요시간</Text>
          <Text style={styles.totalTimeValue}>{formatTime(displayTotalTimeMs)}</Text>
        </View>

        {/* Donut Chart - Task별 시간 비율 (실제 시간 기록된 Task만 표시) */}
        <View style={styles.chartSection}>
          <View style={styles.chartWrapper}>
            <ReportDonutChart
              tasks={tasksWithTime}
              totalTimeMs={chartTotalTimeMs}
              size={320}
              showLabels={true}
              onSegmentClick={handleSegmentClick}
            />
            {/* Center text */}
            <View style={styles.chartCenter}>
              <Text style={styles.chartCenterNumber}>{tasksWithTime.length}</Text>
              <Text style={styles.chartCenterLabel}>Tasks</Text>
            </View>
          </View>
        </View>

        {/* Task List & Rating - 하단 2열 레이아웃 */}
        <View style={styles.bottomSection}>
          {/* 왼쪽: 진행한 Task들 */}
          <View style={styles.tasksColumn}>
            <Text style={styles.columnTitle}>진행한 Task ({displayTasks.length})</Text>
            <View style={styles.taskListContainer}>
              <ScrollView
                style={styles.taskScroll}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={false}
              >
                {displayTasks.length > 0 ? (
                  displayTasks.map(task => (
                    <View key={task.id} style={styles.taskItem}>
                      <View style={styles.taskLeft}>
                        <Icon name="check-circle" size={18} color={COLORS.success} />
                        <Text style={styles.taskContent} numberOfLines={1}>
                          {task.content}
                        </Text>
                      </View>
                      {task.durationMs > 0 && (
                        <Text style={styles.taskDuration}>
                          {formatTimeShort(task.durationMs)}
                        </Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyTaskText}>진행한 Task가 없습니다</Text>
                )}
              </ScrollView>
            </View>
          </View>

          {/* 오른쪽: 평점 */}
          <View style={styles.ratingColumn}>
            <Text style={styles.columnTitle}>평점</Text>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingValue}>{project.report.rating}</Text>
              <Text style={styles.ratingMax}>/5</Text>
            </View>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <Icon
                  key={star}
                  name={star <= project.report!.rating ? 'star' : 'star-outline'}
                  size={20}
                  color={star <= project.report!.rating ? '#FACC15' : COLORS.gray300}
                />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Task Info Modal */}
      <TaskInfoModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        memberCount={project.memberCount}
      />
    </View>
  );
};

// Main Report Page (PastScreen)
export const PastScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Load past projects from API
  const loadPastProjects = useCallback(async () => {
    try {
      const res = await api.getPastProjects();
      if (res.data && res.data.data) {
        const transformed = res.data.data.map(transformProjectSummary);
        setProjects(transformed);
      }
    } catch (error) {
      console.error('과거 프로젝트 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPastProjects();
  }, [loadPastProjects]);

  const completedProjects = projects.filter(p => p.report);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPastProjects();
    setRefreshing(false);
  };

  const handleViewReport = async (project: Project) => {
    // 프로젝트 상세 정보 로드 (tasks 포함)
    setIsLoadingDetail(true);
    try {
      const res = await api.getProject(project.id);
      console.log('handleViewReport - API response:', JSON.stringify(res.data, null, 2));
      if (res.data) {
        const detailedProject = transformProjectDetail(res.data);
        console.log('handleViewReport - transformed project tasks:', detailedProject.tasks.map(t => ({ id: t.id, content: t.content, durationMs: t.durationMs })));
        setSelectedProject(detailedProject);
      } else {
        // API 실패 시 기본 정보로 표시
        setSelectedProject(project);
      }
    } catch (error) {
      console.error('프로젝트 상세 로드 실패:', error);
      setSelectedProject(project);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Loading state
  if (isLoading || isLoadingDetail) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>보고서</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          {isLoadingDetail && (
            <Text style={styles.loadingText}>보고서 로딩 중...</Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Show detail view if project selected
  if (selectedProject) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ReportDetailView
          project={selectedProject}
          onBack={() => setSelectedProject(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>보고서</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {completedProjects.length > 0 ? (
          completedProjects.map(project => (
            <TouchableOpacity
              key={project.id}
              style={styles.reportCard}
              onPress={() => handleViewReport(project)}
              activeOpacity={0.7}
            >
              <Text style={styles.reportCardTitle}>{project.title}</Text>
              {project.report && (
                <View style={styles.reportCardMeta}>
                  <Text style={styles.reportCardMetaText}>
                    평점: {project.report.rating}/5
                  </Text>
                  <Text style={styles.reportCardMetaText}>
                    총 시간: {formatTime(project.totalTimeMs)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Icon name="file-document-outline" size={48} color={COLORS.gray400} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>작성된 보고서가 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base,
    paddingBottom: 100,
  },
  // Report Card
  reportCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.base,
  },
  reportCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  reportCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.base,
  },
  reportCardMetaText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
    marginTop: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  // Detail View
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  detailHeaderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
  },
  detailScroll: {
    flex: 1,
  },
  // Project Info
  projectInfoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  projectTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  totalTimeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  totalTimeValue: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.mono,
    color: COLORS.gray900,
    marginTop: 4,
  },
  // Chart
  chartSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  chartWrapper: {
    position: 'relative',
    width: 320,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartCenterNumber: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
  },
  chartCenterLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  // Bottom Section
  bottomSection: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
    gap: SPACING.xl,
  },
  tasksColumn: {
    flex: 1,
  },
  ratingColumn: {
    alignItems: 'flex-start',
    minWidth: 80,
  },
  columnTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  // Task List
  taskListContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  taskScroll: {
    maxHeight: 200,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  taskContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray800,
    flex: 1,
  },
  taskDuration: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.mono,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  emptyTaskText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.base,
  },
  // Rating
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
  },
  ratingMax: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
    marginTop: SPACING.sm,
  },
  // Task Info Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  taskModalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: Math.min(SCREEN_WIDTH - 32, 400),
    padding: SPACING.xl,
  },
  taskModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  taskModalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
  },
  taskModalContent: {
    gap: SPACING.lg,
  },
  taskInfoRow: {
    gap: SPACING.xs,
  },
  taskInfoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  taskInfoValue: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray900,
  },
  taskInfoTime: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.mono,
    color: COLORS.gray900,
  },
  taskInfoMuted: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskModalCloseButton: {
    marginTop: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  taskModalCloseText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.surface,
  },
});

export default PastScreen;
