import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTimeShort } from '@constants/index';

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

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onStartTimer?: () => void;
  isTimerRunning?: boolean;
  currentTaskId?: string;
  currentProjectId?: string;
  projectId?: string;
  elapsedTime?: number;
  showAssignee?: boolean;
  isTeamProject?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onStartTimer,
  isTimerRunning = false,
  currentTaskId,
  currentProjectId,
  projectId,
  elapsedTime = 0,
  showAssignee = false,
  isTeamProject = false,
}) => {
  const isActive = isTimerRunning && currentTaskId === task.id && currentProjectId === projectId;
  
  // 실시간 시간 계산
  const displayTime = isActive ? (task.durationMs || 0) + elapsedTime : task.durationMs || 0;

  return (
    <View
      style={[
        styles.container,
        task.isDone && styles.containerCompleted,
        isActive && styles.containerActive,
      ]}
    >
      {/* Checkbox */}
      <TouchableOpacity
        style={[
          styles.checkbox,
          task.isDone && styles.checkboxCompleted,
        ]}
        onPress={onToggle}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {task.isDone && (
          <Icon name="check" size={14} color="#fff" />
        )}
      </TouchableOpacity>

      {/* Task content */}
      <View style={styles.contentContainer}>
        <Text
          style={[
            styles.content,
            task.isDone && styles.contentCompleted,
            isActive && styles.contentActive,
          ]}
          numberOfLines={2}
        >
          {task.content}
        </Text>
        
        {/* Project title (if provided) */}
        {task.projectTitle && (
          <Text style={styles.projectTitle} numberOfLines={1}>
            {task.projectTitle}
          </Text>
        )}
        
        {/* Assignee (for team projects) */}
        {showAssignee && task.assigneeName && (
          <View style={styles.assigneeRow}>
            <Icon name="account-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.assigneeName}>{task.assigneeName}</Text>
          </View>
        )}
      </View>

      {/* Duration display */}
      {displayTime > 0 && (
        <Text style={[styles.duration, isActive && styles.durationActive]}>
          {formatTimeShort(displayTime)}
        </Text>
      )}

      {/* Timer button */}
      {!task.isDone && onStartTimer && (
        <TouchableOpacity
          style={[styles.timerButton, isActive && styles.timerButtonActive]}
          onPress={onStartTimer}
          disabled={isTimerRunning && !isActive}
        >
          <Icon 
            name={isActive ? "pause" : "play"} 
            size={18} 
            color={isActive ? COLORS.primary : COLORS.textMuted} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  containerCompleted: {
    opacity: 0.7,
  },
  containerActive: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  checkboxCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  contentContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  content: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  contentCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  contentActive: {
    color: COLORS.primary,
    fontWeight: '500',
  },
  projectTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  assigneeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  assigneeName: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 2,
  },
  duration: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontFamily: 'System',
    marginRight: SPACING.sm,
  },
  durationActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButtonActive: {
    backgroundColor: COLORS.primaryLight + '30',
  },
});

export default TaskItem;
