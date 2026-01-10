import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { ReportDonutChart } from './ReportDonutChart';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime, formatTimeShort } from '@constants/index';

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

  if (!project) return null;

  const completedTasks = project.tasks.filter(t => t.isDone);
  const tasksWithTime = completedTasks.filter(t => t.durationMs > 0);

  const handleRatingChange = (text: string) => {
    const value = parseInt(text);
    if (!isNaN(value) && value >= 0 && value <= 5) {
      setRating(value);
    } else if (text === '') {
      setRating(0);
    }
  };

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

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <Icon
              name={star <= rating ? 'star' : 'star-outline'}
              size={24}
              color={star <= rating ? '#FACC15' : COLORS.gray300}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>보고서 작성</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Project Info */}
            <View style={styles.projectInfo}>
              <Text style={styles.projectTitle}>{project.title}</Text>
              <Text style={styles.totalTimeLabel}>총 소요시간</Text>
              <Text style={styles.totalTime}>{formatTime(project.totalTimeMs)}</Text>
            </View>

            {/* Donut Chart */}
            <View style={styles.chartContainer}>
              <ReportDonutChart
                tasks={tasksWithTime}
                totalTimeMs={project.totalTimeMs}
                size={200}
                showLabels={false}
              />
            </View>

            {/* Completed Tasks List */}
            <View style={styles.taskListSection}>
              <Text style={styles.sectionLabel}>
                진행한 Task ({completedTasks.length})
              </Text>
              <View style={styles.taskListContainer}>
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
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingSection}>
              <Text style={styles.sectionLabel}>평점</Text>
              <View style={styles.ratingRow}>
                <TextInput
                  style={styles.ratingInput}
                  value={String(rating)}
                  onChangeText={handleRatingChange}
                  keyboardType="number-pad"
                  maxLength={1}
                />
                <Text style={styles.ratingDivider}>/ 5</Text>
                {renderStars()}
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
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  scrollView: {
    flex: 1,
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
    fontWeight: '600',
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
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },
  totalTimeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  totalTime: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    fontFamily: 'System',
    color: COLORS.gray900,
    marginTop: 4,
  },
  // Chart
  chartContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  // Task List
  taskListSection: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  taskListContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
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
    gap: SPACING.sm,
  },
  taskContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray800,
    flex: 1,
  },
  taskDuration: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'System',
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
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  ratingInput: {
    width: 60,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.xl,
    textAlign: 'center',
    fontFamily: 'System',
    fontWeight: '700',
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray900,
  },
  ratingDivider: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
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
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
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
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: '#fff',
  },
});

export default WriteReportModal;
