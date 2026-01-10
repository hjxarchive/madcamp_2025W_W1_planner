import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime } from '@constants/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface Task {
  id: string;
  content: string;
  isDone: boolean;
  durationMs: number;
}

interface Report {
  rating: number;
  memo?: string;
  createdAt: Date;
  totalTimeMs: number;
  completedTasks: number;
}

interface Project {
  id: string;
  title: string;
  totalTimeMs: number;
  memberCount: number;
  tasks: Task[];
  report?: Report;
}

// Sample data (보고서가 있는 완료된 프로젝트)
const sampleCompletedProjects: Project[] = [
  {
    id: 'proj-completed-1',
    title: '알고리즘 스터디',
    totalTimeMs: 18000000, // 5시간
    memberCount: 1,
    tasks: [
      { id: 't1', content: 'BFS/DFS 복습', isDone: true, durationMs: 7200000 },
      { id: 't2', content: '다이나믹 프로그래밍 문제풀이', isDone: true, durationMs: 5400000 },
      { id: 't3', content: '그래프 알고리즘 정리', isDone: true, durationMs: 5400000 },
    ],
    report: {
      rating: 4,
      memo: '',
      createdAt: new Date('2026-01-08'),
      totalTimeMs: 18000000,
      completedTasks: 3,
    },
  },
  {
    id: 'proj-completed-2',
    title: '포트폴리오 제작',
    totalTimeMs: 25200000, // 7시간
    memberCount: 1,
    tasks: [
      { id: 't4', content: '디자인 시안', isDone: true, durationMs: 10800000 },
      { id: 't5', content: '프론트엔드 구현', isDone: true, durationMs: 10800000 },
      { id: 't6', content: '배포', isDone: true, durationMs: 3600000 },
    ],
    report: {
      rating: 5,
      memo: '',
      createdAt: new Date('2026-01-05'),
      totalTimeMs: 25200000,
      completedTasks: 3,
    },
  },
];

// Donut Chart Component for Report
const ReportDonutChart: React.FC<{
  tasks: Task[];
  totalTimeMs: number;
  size?: number;
}> = ({ tasks, totalTimeMs, size = 200 }) => {
  const grayColors = ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB', '#E5E7EB', '#F3F4F6'];
  const tasksWithTime = tasks.filter(t => t.durationMs > 0);

  if (totalTimeMs === 0 || tasksWithTime.length === 0) {
    return (
      <View style={[donutStyles.container, { width: size, height: size }]}>
        <Text style={donutStyles.emptyText}>시간 기록 없음</Text>
      </View>
    );
  }

  // Calculate segments
  let currentAngle = -90;
  const segments = tasksWithTime.map((task, index) => {
    const percentage = (task.durationMs / totalTimeMs) * 100;
    const angle = (percentage / 100) * 360;
    const segment = {
      task,
      percentage,
      startAngle: currentAngle,
      angle,
      color: grayColors[index % grayColors.length],
    };
    currentAngle += angle;
    return segment;
  });

  return (
    <View style={[donutStyles.container, { width: size, height: size }]}>
      {/* Simple visual representation using views */}
      <View style={donutStyles.chartContainer}>
        {segments.map((segment, index) => (
          <View
            key={segment.task.id}
            style={[
              donutStyles.segment,
              {
                backgroundColor: segment.color,
                width: `${Math.max(segment.percentage, 10)}%`,
              },
            ]}
          />
        ))}
      </View>
      <View style={donutStyles.centerInfo}>
        <Text style={donutStyles.centerText}>{tasksWithTime.length}</Text>
        <Text style={donutStyles.centerLabel}>Tasks</Text>
      </View>
    </View>
  );
};

const donutStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray400,
  },
  chartContainer: {
    flexDirection: 'row',
    height: 16,
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  segment: {
    height: '100%',
  },
  centerInfo: {
    alignItems: 'center',
  },
  centerText: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  centerLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
});

// Report Detail View
const ReportDetailView: React.FC<{
  project: Project;
  onBack: () => void;
}> = ({ project, onBack }) => {
  if (!project.report) return null;

  const completedTasks = project.tasks.filter(t => t.isDone);
  const tasksWithTime = completedTasks.filter(t => t.durationMs > 0);

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
        {/* Project Info */}
        <View style={styles.projectInfoSection}>
          <Text style={styles.projectTitle}>{project.title}</Text>
          <Text style={styles.totalTimeLabel}>총 소요시간</Text>
          <Text style={styles.totalTimeValue}>{formatTime(project.totalTimeMs)}</Text>
        </View>

        {/* Donut Chart */}
        <View style={styles.chartSection}>
          <ReportDonutChart
            tasks={tasksWithTime}
            totalTimeMs={project.totalTimeMs}
            size={200}
          />
        </View>

        {/* Task List & Rating */}
        <View style={styles.bottomSection}>
          {/* Completed Tasks */}
          <View style={styles.tasksColumn}>
            <Text style={styles.columnTitle}>진행한 Task들</Text>
            <View style={styles.taskList}>
              {completedTasks.map(task => (
                <View key={task.id} style={styles.taskRow}>
                  <Icon name="check-circle" size={18} color={COLORS.gray900} />
                  <Text style={styles.taskText} numberOfLines={1}>{task.content}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.ratingColumn}>
            <Text style={styles.columnTitle}>평점</Text>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingValue}>{project.report.rating}</Text>
              <Text style={styles.ratingMax}>/5</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Main Report Page (PastScreen)
export const PastScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<Project[]>(sampleCompletedProjects);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const completedProjects = projects.filter(p => p.report);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleViewReport = (project: Project) => {
    setSelectedProject(project);
  };

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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: COLORS.gray900,
  },
  detailScroll: {
    flex: 1,
  },
  projectInfoSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  projectTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.gray900,
    marginBottom: SPACING.base,
  },
  totalTimeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  totalTimeValue: {
    fontSize: FONT_SIZES['4xl'],
    fontWeight: 'bold',
    color: COLORS.gray900,
    fontFamily: 'System',
  },
  chartSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
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
  },
  columnTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.md,
  },
  taskList: {
    gap: SPACING.sm,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  taskText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray800,
    flex: 1,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.gray900,
  },
  ratingMax: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    marginBottom: 8,
  },
});

export default PastScreen;
