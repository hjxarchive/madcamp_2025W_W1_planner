import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { ReportDonutChart } from './ReportDonutChart';
import { COLORS, FONT_SIZES, FONT_WEIGHTS, FONTS, SPACING, BORDER_RADIUS, formatTime, formatTimeShort } from '@constants/index';

interface Task {
  id: string;
  content: string;
  isDone: boolean;
  durationMs: number;
}

interface Project {
  id: string;
  title: string;
  totalTimeMs: number;
  tasks: Task[];
}

interface ReportData {
  rating: number;
  memo: string;
  createdAt: Date;
  totalTimeMs: number;
  completedTasks: number;
}

interface WriteReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSave: (reportData: ReportData) => void;
}

export const WriteReportModal: React.FC<WriteReportModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave,
}) => {
  const [rating, setRating] = useState(5);
  const [memo, setMemo] = useState('');

  if (!isOpen || !project) return null;

  const completedTasks = project.tasks.filter(t => t.isDone);
  const tasksWithTime = completedTasks.filter(t => t.durationMs > 0);

  const handleSave = () => {
    onSave({
      rating,
      memo,
      createdAt: new Date(),
      totalTimeMs: project.totalTimeMs,
      completedTasks: completedTasks.length,
    });
    setRating(5);
    setMemo('');
    onClose();
  };

  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>보고서 작성</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            {/* Project Info - 프로젝트명 + 총 소요시간 */}
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.totalTimeLabel}>총 소요시간</Text>
              <Text style={styles.totalTime}>{formatTime(project.totalTimeMs)}</Text>
            </View>

            {/* Donut Chart - Task별 시간 비율 */}
            <View style={styles.chartContainer}>
              <View style={styles.chartWrapper}>
                <ReportDonutChart
                  tasks={completedTasks}
                  totalTimeMs={project.totalTimeMs}
                  size={200}
                  showLabels={false}
                />
                {/* Center text */}
                <View style={styles.chartCenter}>
                  <Text style={styles.chartCenterNumber}>{completedTasks.length}</Text>
                  <Text style={styles.chartCenterLabel}>Tasks</Text>
                </View>
              </View>
            </View>

            {/* Task List - 진행한 Task들 */}
            <View style={styles.taskListSection}>
              <Text style={styles.sectionLabel}>진행한 Task ({completedTasks.length})</Text>
              <View style={styles.taskListContainer}>
                <ScrollView
                  style={styles.taskScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={false}
                >
                  {completedTasks.length > 0 ? (
                    completedTasks.map(task => (
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
                    <Text style={styles.emptyTaskText}>완료된 Task가 없습니다</Text>
                  )}
                </ScrollView>
              </View>
            </View>

            {/* Rating - 평점 */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>평점</Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starButton}>
                    <Icon
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#FACC15' : COLORS.gray300}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>나중에</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>저장하기</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: Math.min(SCREEN_WIDTH - 32, 400),
    maxHeight: '90%',
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
  },
  closeButton: {
    padding: 4,
  },
  // Project Info
  projectInfo: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  projectTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  totalTimeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  totalTime: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.mono,
    color: COLORS.gray900,
    marginTop: 4,
  },
  // Chart
  chartContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  chartWrapper: {
    position: 'relative',
    width: 200,
    height: 200,
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
  // Task List
  taskListSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  taskListContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
  },
  taskScroll: {
    maxHeight: 160,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
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
  ratingSection: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  starButton: {
    padding: SPACING.xs,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#fff',
  },
});

export default WriteReportModal;
