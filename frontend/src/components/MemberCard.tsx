import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime } from '@constants/index';
import type { Member, Task, Project } from '../types';

interface MemberTimerInfo {
  userId: string;
  userName: string;
  checklistContent: string;
  startedAt: string;
}

interface MemberCardProps {
  member: Member;
  project: Project;
  currentTask: Task | null;
  elapsedTime: number;
  isActive: boolean;
  memberTimerInfo?: MemberTimerInfo;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  project,
  currentTask,
  elapsedTime,
  isActive,
  memberTimerInfo,
}) => {
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dotPulseAnim = useRef(new Animated.Value(0.4)).current;

  // 팀원의 경과 시간 계산을 위한 state
  const [teamMemberElapsed, setTeamMemberElapsed] = useState(0);

  // Pulse animation for active state
  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      // 도트 펄스 애니메이션
      const dotPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(dotPulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(dotPulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      dotPulse.start();

      return () => {
        pulse.stop();
        dotPulse.stop();
      };
    } else {
      pulseAnim.setValue(1);
      dotPulseAnim.setValue(0.4);
    }
  }, [isActive, pulseAnim, dotPulseAnim]);

  // 팀원의 경과 시간 계산 (startedAt 기준)
  useEffect(() => {
    if (isActive && memberTimerInfo && !currentTask) {
      // 팀원의 타이머인 경우 (본인 타이머는 currentTask가 있음)
      const startTime = new Date(memberTimerInfo.startedAt).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        setTeamMemberElapsed(Math.max(0, now - startTime));
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);

      return () => clearInterval(interval);
    } else {
      setTeamMemberElapsed(0);
    }
  }, [isActive, memberTimerInfo, currentTask]);

  // 해당 멤버에게 할당된 Task들의 시간 합계 계산
  const memberTasks = project?.tasks?.filter(t => t.assigneeId === member.id) || [];

  // 현재 실행 중인 Task가 이 멤버에게 할당되어 있는지 확인 (본인 타이머)
  const isCurrentTaskAssigned = currentTask && currentTask.assigneeId === member.id;

  // 활성 경과 시간 (본인 타이머면 elapsedTime, 팀원 타이머면 teamMemberElapsed)
  const activeElapsedTime = isCurrentTaskAssigned ? elapsedTime : teamMemberElapsed;

  // 멤버의 총 시간 계산 (실시간 반영)
  const memberTimeMs = memberTasks.reduce((sum, task) => {
    let taskDuration = task.durationMs || 0;
    // 현재 실행 중인 Task이고 이 멤버에게 할당된 경우 elapsedTime 추가
    if (isCurrentTaskAssigned && currentTask && currentTask.id === task.id && elapsedTime >= 0) {
      taskDuration += elapsedTime;
    }
    return sum + taskDuration;
  }, 0);

  // 진행률 계산 (완료된 Task / 전체 Task)
  const completedTasks = memberTasks.filter(t => t.isDone).length;
  const memberProgress = memberTasks.length > 0 ? Math.round((completedTasks / memberTasks.length) * 100) : 0;

  // 표시 시간 계산 (팀원 타이머 활성 시에도 경과 시간 추가)
  let displayTimeMs = memberTimeMs > 0 ? memberTimeMs : (member.timeMs || 0);
  if (isActive && memberTimerInfo && !currentTask) {
    // 팀원의 활성 타이머인 경우 경과 시간 추가
    displayTimeMs += teamMemberElapsed;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        isActive && styles.containerActive,
        { transform: [{ scale: pulseAnim }] },
      ]}
    >
      {/* Avatar */}
      <View style={[styles.avatar, isActive && styles.avatarActive]}>
        <Text style={styles.avatarEmoji}>{member.profileEmoji || '👤'}</Text>
      </View>
      
      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {member.nickname || '멤버'}
      </Text>
      
      {/* Time */}
      <Text style={[styles.time, isActive && styles.timeActive]}>
        {formatTime(displayTimeMs)}
      </Text>
      
      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            isActive && styles.progressBarActive,
            { width: `${memberProgress}%` },
          ]}
        />
      </View>
      
      {/* Active indicator - 3개의 펄스 도트 */}
      {isActive && (
        <View style={styles.activeIndicator}>
          <View style={styles.activeDotRow}>
            <Animated.View style={[styles.activeDot, { opacity: dotPulseAnim }]} />
            <Animated.View style={[styles.activeDot, styles.activeDotYellow, { opacity: dotPulseAnim }]} />
            <Animated.View style={[styles.activeDot, styles.activeDotOrangeLight, { opacity: dotPulseAnim }]} />
          </View>
          <Text style={styles.activeText}>측정 중</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
    marginHorizontal: 2,
    marginVertical: 2,
  },
  containerActive: {
    backgroundColor: '#F9FAFB', // gray-50
    borderWidth: 2,
    borderColor: '#D1D5DB', // gray-300
    shadowColor: '#6B7280', // gray-500
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
    marginHorizontal: 4,
    marginVertical: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarActive: {
    backgroundColor: 'transparent',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  name: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray900,
    textAlign: 'center',
  },
  time: {
    fontSize: FONT_SIZES.xs,
    fontFamily: 'System',
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  timeActive: {
    fontWeight: '600',
    color: COLORS.gray800,
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    marginTop: SPACING.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.gray800,
    borderRadius: 3,
  },
  progressBarActive: {
    backgroundColor: '#6B7280', // gray-500
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: 4,
  },
  activeDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6B7280', // gray-500
  },
  activeDotYellow: {
    backgroundColor: '#9CA3AF', // gray-400
  },
  activeDotOrangeLight: {
    backgroundColor: '#D1D5DB', // gray-300
  },
  activeText: {
    fontSize: FONT_SIZES.xs,
    color: '#4B5563', // gray-600
    fontWeight: '500',
  },
});

export default MemberCard;
