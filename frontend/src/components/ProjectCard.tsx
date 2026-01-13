import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS, formatTime, formatTimeShort, formatDate } from '@constants/index';
import type { Project, Task } from '../types';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  isTimerRunning?: boolean;
  currentProjectId?: string;
  elapsedTime?: number;
}

// 진행률 계산
const calculateProgress = (tasks: Task[]): number => {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(t => t.isDone).length;
  return Math.round((completed / tasks.length) * 100);
};

// Circular Progress Component
const CircularProgress: React.FC<{ progress: number; size?: number }> = ({ progress, size = 40 }) => {
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View style={{ width: size, height: size }}>
      {/* Background circle */}
      <View
        style={[
          styles.circleBase,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.gray200,
          },
        ]}
      />
      {/* Progress circle - simplified visual */}
      <View
        style={[
          styles.circleProgress,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.gray800,
            borderTopColor: 'transparent',
            borderRightColor: progress > 25 ? COLORS.gray800 : 'transparent',
            borderBottomColor: progress > 50 ? COLORS.gray800 : 'transparent',
            borderLeftColor: progress > 75 ? COLORS.gray800 : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
      {/* Center text */}
      <View style={[styles.circleCenter, { width: size, height: size }]}>
        <Text style={styles.circleText}>{progress}%</Text>
      </View>
    </View>
  );
};

// Main Project Card (Momento 스타일)
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onPress,
  isTimerRunning = false,
  currentProjectId,
  elapsedTime = 0,
}) => {
  const progress = calculateProgress(project.tasks);
  const completedTasks = project.tasks.filter(t => t.isDone).length;
  const isActive = isTimerRunning && currentProjectId === project.id;
  
  // 실시간 시간 계산
  const displayTime = isActive ? project.totalTimeMs + elapsedTime : project.totalTimeMs;
  
  // 팀 프로젝트 여부
  const isTeam = project.memberCount > 1;

  return (
    <TouchableOpacity
      style={[styles.container, isActive && styles.containerActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* 프로젝트 정보 */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {project.title}
            </Text>
            {isTeam && (
              <View style={styles.teamBadge}>
                <Icon name="account-group-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.teamCount}>{project.memberCount}</Text>
              </View>
            )}
          </View>
          
          {/* 시간 및 Task 정보 */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Icon name="clock-outline" size={14} color={isActive ? COLORS.primary : COLORS.textMuted} />
              <Text style={[styles.statText, styles.timeText, isActive && styles.statTextActive]}>
                {formatTimeShort(displayTime)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="checkbox-marked-circle-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.statText}>
                {completedTasks}/{project.tasks.length}
              </Text>
            </View>
            {project.dueDate && (
              <View style={styles.statItem}>
                <Icon name="calendar-outline" size={14} color={COLORS.textMuted} />
                <Text style={styles.statText}>
                  ~{formatDate(project.dueDate)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 진행률 원형 */}
        <CircularProgress progress={progress} />
      </View>

      {/* 하단 프로그레스 바 */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* 활성 표시 */}
      {isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.activeDot} />
        </View>
      )}
    </TouchableOpacity>
  );
};

// MainProjectCard는 ProjectCard의 alias로 유지 (호환성)
export const MainProjectCard = ProjectCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  containerActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F9FF',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.base,
  },
  infoSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
    flex: 1,
  },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  teamCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: 4,
  },
  timeText: {
    fontFamily: FONTS.mono,
  },
  statTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
    fontFamily: FONTS.mono,
  },
  // Circular progress
  circleBase: {
    position: 'absolute',
  },
  circleProgress: {
    position: 'absolute',
  },
  circleCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.textPrimary,
  },
  // Progress bar
  progressBar: {
    height: 3,
    backgroundColor: COLORS.gray100,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.gray800,
  },
  // Active indicator
  activeIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
});

export default ProjectCard;
