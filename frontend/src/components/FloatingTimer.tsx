import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime } from '@constants/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Types
interface Task {
  id?: string;
  content?: string;
}

interface Project {
  id?: string;
  title?: string;
}

interface FloatingTimerProps {
  isRunning: boolean;
  elapsedTime: number;
  project?: Project | null;
  task?: Task | null;
  onStop: () => void;
  onExpand?: () => void;
}

export const FloatingTimer: React.FC<FloatingTimerProps> = ({
  isRunning,
  elapsedTime,
  project,
  task,
  onStop,
  onExpand,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation when running
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  // 표시하지 않음 (타이머가 실행 중이지 않으면)
  if (!isRunning) return null;

  return (
    <Animated.View style={[styles.container, { opacity: pulseAnim }]}>
      <TouchableOpacity 
        style={styles.content} 
        onPress={onExpand}
        activeOpacity={0.9}
      >
        {/* 상태 표시 점 */}
        <Animated.View style={[styles.statusDot, { opacity: pulseAnim }]} />
        
        {/* 프로젝트/Task 정보 */}
        <View style={styles.infoSection}>
          <Text style={styles.projectTitle} numberOfLines={1}>
            {project?.title || '프로젝트 없음'}
          </Text>
          <Text style={styles.taskContent} numberOfLines={1}>
            {task?.content || 'Task 없음'}
          </Text>
        </View>

        {/* 시간 표시 */}
        <View style={styles.timeSection}>
          <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
        </View>

        {/* 정지 버튼 */}
        <TouchableOpacity style={styles.stopButton} onPress={onStop}>
          <Icon name="stop" size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80,
    left: SPACING.base,
    right: SPACING.base,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  infoSection: {
    flex: 1,
    marginRight: SPACING.md,
  },
  projectTitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
  },
  taskContent: {
    fontSize: FONT_SIZES.sm,
    color: '#fff',
    fontWeight: '500',
  },
  timeSection: {
    marginRight: SPACING.md,
  },
  timeText: {
    fontSize: FONT_SIZES.md,
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'System',
  },
  stopButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingTimer;
