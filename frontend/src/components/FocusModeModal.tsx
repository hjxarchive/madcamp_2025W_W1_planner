import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Easing,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Defs, ClipPath, Circle, G } from 'react-native-svg';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS, formatTime } from '@constants/index';

interface Task {
  id: string;
  content: string;
}

interface Project {
  id: string;
  title: string;
}

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  task: Task | null;
  elapsedTime: number;
  onStop: () => void;
}

// Timer size for focus mode (larger than main screen)
const SIZE = 224;
const BORDER_WIDTH = 4;
const INNER_SIZE = SIZE - BORDER_WIDTH * 2;

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  project,
  task,
  elapsedTime,
  onStop,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [time, setTime] = useState(0);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Generate wave path - same as TotalTimeDisplay
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
    if (!isOpen) return;

    // Wave animation
    const animate = () => {
      timeRef.current += 1;
      setTime(timeRef.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    // Pulse animation for border
    const pulseAnimation = Animated.loop(
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

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      pulseAnimation.stop();
    };
  }, [isOpen, pulseAnim]);

  // Generate wave paths
  const wave1Path = generateWavePath(time, 0, 1.0, 1.0, 1.0, 0);
  const wave2Path = generateWavePath(time, 5, 0.9, 1.15, 1.4, Math.PI / 3);
  const wave3Path = generateWavePath(time, 12, 0.75, 0.85, 0.85, Math.PI / 1.5);
  const wave4Path = generateWavePath(time, 20, 0.6, 1.3, 1.1, Math.PI);

  // Wave colors (running state)
  const wave1Color = 'rgba(124, 185, 232, 0.5)';
  const wave2Color = 'rgba(124, 185, 232, 0.45)';
  const wave3Color = 'rgba(124, 185, 232, 0.4)';
  const wave4Color = 'rgba(124, 185, 232, 0.3)';
  const bgColor = '#E8F4FD';

  const handleStop = () => {
    onStop();
    onClose();
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.surface} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="chevron-down" size={28} color={COLORS.gray600} />
          </TouchableOpacity>
          <Text style={styles.headerText}>측정 중</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Project & Task Info */}
          <Text style={styles.projectTitle}>{project?.title || ''}</Text>
          <Text style={styles.taskContent}>{task?.content || ''}</Text>

          {/* Large Timer Circle */}
          <View style={styles.timerContainer}>
            <View style={styles.circleContainer}>
              {/* SVG Wave Animation */}
              <Svg
                width={INNER_SIZE}
                height={INNER_SIZE}
                style={styles.svgContainer}
                viewBox={`0 0 ${INNER_SIZE} ${INNER_SIZE}`}
              >
                <Defs>
                  <ClipPath id="focusCircleClip">
                    <Circle cx={INNER_SIZE / 2} cy={INNER_SIZE / 2} r={INNER_SIZE / 2} />
                  </ClipPath>
                </Defs>

                <G clipPath="url(#focusCircleClip)">
                  {/* Background */}
                  <Circle cx={INNER_SIZE / 2} cy={INNER_SIZE / 2} r={INNER_SIZE / 2} fill={bgColor} />

                  {/* Waves */}
                  <Path d={wave4Path} fill={wave4Color} />
                  <Path d={wave3Path} fill={wave3Color} />
                  <Path d={wave2Path} fill={wave2Color} />
                  <Path d={wave1Path} fill={wave1Color} />
                </G>
              </Svg>

              {/* Pulse Border */}
              <Animated.View
                style={[
                  styles.pulseBorder,
                  { opacity: pulseAnim }
                ]}
              />

              {/* Time Display */}
              <View style={styles.timeContainer}>
                <Text style={styles.timeText}>{formatTime(elapsedTime)}</Text>
              </View>
            </View>
          </View>

          {/* Status Indicator */}
          <View style={styles.statusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>측정 중...</Text>
          </View>

          {/* Stop Button */}
          <TouchableOpacity style={styles.stopButton} onPress={handleStop}>
            <Icon name="stop" size={20} color="#fff" />
            <Text style={styles.stopButtonText}>측정 종료</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
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
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  projectTitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  taskContent: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: SPACING['2xl'],
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
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
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
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
    fontSize: 36,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    fontFamily: FONTS.mono,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING['3xl'],
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: SPACING.sm,
  },
  statusText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
    paddingVertical: SPACING.base,
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  stopButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: '#fff',
  },
});

export default FocusModeModal;
