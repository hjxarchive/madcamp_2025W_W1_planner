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
  Dimensions,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
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

  // 디버깅: 조건 체크 전에 로그
  console.log('WriteReportModal render:', { isOpen, hasProject: !!project });

  if (!isOpen || !project) return null;

  const completedTasks = project.tasks.filter(t => t.isDone);
  const tasksWithTime = completedTasks.filter(t => t.durationMs > 0);

  const handleRatingChange = (text: string) => {
    const value = parseInt(text);
    if (!isNaN(value) && value >= 1 && value <= 5) {
      setRating(value);
    } else if (text === '') {
      setRating(1);
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

  // 간단한 테스트 Modal
  return (
    <Modal
      visible={true}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          width: SCREEN_WIDTH - 48,
          maxHeight: '80%',
        }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
            보고서 작성
          </Text>
          <Text style={{ fontSize: 16, marginBottom: 8 }}>
            프로젝트: {project.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
            총 소요시간: {formatTime(project.totalTimeMs)}
          </Text>
          
          <Text style={{ fontSize: 14, marginBottom: 8 }}>평점: {rating} / 5</Text>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={{ padding: 4 }}>
                <Icon
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={28}
                  color={star <= rating ? '#FACC15' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              onPress={onClose}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#666' }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor: '#16A34A',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>저장</Text>
            </TouchableOpacity>
          </View>
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
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: Math.min(SCREEN_WIDTH - 32, 500),
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
    fontSize: FONT_SIZES['2xl'],
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
