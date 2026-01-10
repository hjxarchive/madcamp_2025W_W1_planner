import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONT_SIZES } from '@constants/index';

interface CircularProgressProps {
  progress: number;
  completedTasks: number;
  totalTasks: number;
  size?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progress,
  completedTasks,
  totalTasks,
  size = 120,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const isCompleted = progress === 100;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg
        width={size}
        height={size}
        style={styles.svg}
      >
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.gray200}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isCompleted ? COLORS.success : COLORS.gray800}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {isCompleted ? (
          <>
            <Text style={styles.emoji}>🎉</Text>
            <Text style={styles.completedText}>완료!</Text>
          </>
        ) : (
          <>
            <Text style={styles.progressText}>{progress}%</Text>
            <Text style={styles.taskCountText}>
              {completedTasks}/{totalTasks}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  labelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  taskCountText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  emoji: {
    fontSize: 28,
  },
  completedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 2,
  },
});

export default CircularProgress;
