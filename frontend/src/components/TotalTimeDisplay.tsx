import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, ClipPath, Circle, G } from 'react-native-svg';
import { COLORS, FONT_SIZES, FONTS, SPACING, formatTime } from '@constants/index';

interface TotalTimeDisplayProps {
  timeMs: number;
  isRunning: boolean;
  currentTask?: { content: string } | null;
  onTimerClick?: () => void;
}

// Constants matching MomentoApp.jsx exactly
const SIZE = 192;
const BORDER_WIDTH = 4;
const INNER_SIZE = SIZE - BORDER_WIDTH * 2;

export const TotalTimeDisplay: React.FC<TotalTimeDisplayProps> = ({
  timeMs,
  isRunning,
  currentTask,
  onTimerClick,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Generate wave path - exactly matching MomentoApp.jsx
  const generateWavePath = (
    t: number,
    baseYOffset: number,
    amplitudeMultiplier: number,
    frequencyMultiplier: number,
    speedMultiplier: number,
    phaseOffset: number
  ): string => {
    const baseY = INNER_SIZE * 0.55 + baseYOffset;
    const amplitude = 30 * amplitudeMultiplier;
    const frequency = 0.02 * frequencyMultiplier;
    const speed = 0.06 * speedMultiplier;
    
    let path = `M 0 ${baseY}`;
    for (let x = 0; x <= INNER_SIZE; x += 1.5) {
      const y = baseY + amplitude * Math.sin((x * frequency) + (t * speed) + phaseOffset);
      path += ` L ${x} ${y}`;
    }
    path += ` L ${INNER_SIZE} ${INNER_SIZE} L 0 ${INNER_SIZE} Z`;
    return path;
  };

  useEffect(() => {
    // Wave animation using requestAnimationFrame - matching MomentoApp.jsx
    const animate = () => {
      timeRef.current += 1;
      setTime(timeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);

    // Pulse animation for border (only when running)
    let pulseAnimation: Animated.CompositeAnimation | null = null;
    if (isRunning) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pulseAnimation) {
        pulseAnimation.stop();
      }
    };
  }, [isRunning, pulseAnim]);

  // Generate paths for 4 waves - exactly matching MomentoApp.jsx parameters
  // Wave 1: baseYOffset=0, amplitude=1.0, frequency=1.0, speed=1.0, phase=0
  const wave1Path = generateWavePath(time, 0, 1.0, 1.0, 1.0, 0);
  // Wave 2: baseYOffset=5, amplitude=0.9, frequency=1.15, speed=1.4, phase=PI/3
  const wave2Path = generateWavePath(time, 5, 0.9, 1.15, 1.4, Math.PI / 3);
  // Wave 3: baseYOffset=12, amplitude=0.75, frequency=0.85, speed=0.85, phase=PI/1.5
  const wave3Path = generateWavePath(time, 12, 0.75, 0.85, 0.85, Math.PI / 1.5);
  // Wave 4: baseYOffset=20, amplitude=0.6, frequency=1.3, speed=1.1, phase=PI
  const wave4Path = generateWavePath(time, 20, 0.6, 1.3, 1.1, Math.PI);

  // Colors based on running state - exactly matching MomentoApp.jsx
  const wave1Color = isRunning ? 'rgba(124, 185, 232, 0.5)' : 'rgba(234, 179, 8, 0.45)';
  const wave2Color = isRunning ? 'rgba(124, 185, 232, 0.45)' : 'rgba(234, 179, 8, 0.4)';
  const wave3Color = isRunning ? 'rgba(124, 185, 232, 0.4)' : 'rgba(234, 179, 8, 0.35)';
  const wave4Color = isRunning ? 'rgba(124, 185, 232, 0.3)' : 'rgba(234, 179, 8, 0.25)';
  const bgColor = isRunning ? '#E8F4FD' : '#ffffff';

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onTimerClick}
      activeOpacity={0.8}
    >
      {/* 원형 타이머 */}
      <View style={[
        styles.circleContainer,
        { borderColor: isRunning ? COLORS.primary : COLORS.gray300 }
      ]}>
        {/* SVG Wave Animation */}
        <Svg width={INNER_SIZE} height={INNER_SIZE} style={styles.svgContainer} viewBox={`0 0 ${INNER_SIZE} ${INNER_SIZE}`}>
          <Defs>
            <ClipPath id="circleClip">
              <Circle cx={INNER_SIZE / 2} cy={INNER_SIZE / 2} r={INNER_SIZE / 2} />
            </ClipPath>
          </Defs>
          
          <G clipPath="url(#circleClip)">
            {/* Background */}
            <Circle cx={INNER_SIZE / 2} cy={INNER_SIZE / 2} r={INNER_SIZE / 2} fill={bgColor} />
            
            {/* Wave 4 (back, smallest) - rendered first (bottom layer) */}
            <Path d={wave4Path} fill={wave4Color} />
            
            {/* Wave 3 */}
            <Path d={wave3Path} fill={wave3Color} />
            
            {/* Wave 2 */}
            <Path d={wave2Path} fill={wave2Color} />
            
            {/* Wave 1 (front, largest) - rendered last (top layer) */}
            <Path d={wave1Path} fill={wave1Color} />
          </G>
        </Svg>
        
        {/* 펄스 보더 (실행 중일 때만) */}
        {isRunning && (
          <Animated.View 
            style={[
              styles.pulseBorder,
              { opacity: pulseAnim }
            ]} 
          />
        )}
        
        {/* 시간 표시 */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(timeMs)}</Text>
          {isRunning && currentTask && (
            <Text style={styles.taskText} numberOfLines={1}>
              {currentTask.content}
            </Text>
          )}
        </View>
      </View>

      {/* 상태 표시 */}
      {isRunning && (
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>측정 중...</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.surface,
  },
  circleContainer: {
    width: SIZE,
    height: SIZE,
    aspectRatio: 1,
    borderRadius: SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: BORDER_WIDTH,
    backgroundColor: 'transparent',
    // Shadow for inner effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: INNER_SIZE / 2,
    overflow: 'hidden',
  },
  pulseBorder: {
    position: 'absolute',
    top: -BORDER_WIDTH,
    left: -BORDER_WIDTH,
    right: -BORDER_WIDTH,
    bottom: -BORDER_WIDTH,
    borderRadius: SIZE / 2 + BORDER_WIDTH,
    borderWidth: BORDER_WIDTH,
    borderColor: COLORS.primary,
  },
  timeContainer: {
    alignItems: 'center',
    zIndex: 10,
  },
  timeText: {
    fontSize: 30,
    color: COLORS.gray900,
    fontFamily: FONTS.monoBold,
    letterSpacing: 0.5,
  },
  taskText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    maxWidth: 140,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
});

export default TotalTimeDisplay;
