import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import {
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  SPACING,
  BORDER_RADIUS,
  FONTS,
} from '@constants/index';
import { useAuth } from '@contexts/AuthContext';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

// 영수증 상단/하단 톱니 모양 컴포넌트 (찢어진 느낌)
const JaggedEdgeHorizontal: React.FC<{ width: number }> = ({ width }) => {
  const teethCount = Math.floor(width / 8);
  return (
    <View style={[styles.jaggedEdge, { width }]}>
      {Array.from({ length: teethCount }).map((_, i) => {
        const randomHeight = 6 + Math.random() * 4;
        const randomWidth = 6 + Math.random() * 4;
        return (
          <View 
            key={i} 
            style={[
              styles.tooth, 
              { 
                width: randomWidth,
                height: randomHeight,
              }
            ]} 
          />
        );
      })}
    </View>
  );
};

// 영수증 좌우 톱니 모양 컴포넌트
const JaggedEdgeVertical: React.FC<{ height: number; side: 'left' | 'right' }> = ({ height, side }) => {
  const teethCount = Math.floor(height / 8);
  return (
    <View style={[styles.jaggedEdgeVertical, { height, [side]: 0 }]}>
      {Array.from({ length: teethCount }).map((_, i) => {
        const randomWidth = 4 + Math.random() * 3;
        const randomHeight = 6 + Math.random() * 4;
        return (
          <View 
            key={i} 
            style={[
              styles.toothVertical, 
              { 
                width: randomWidth,
                height: randomHeight,
                [side === 'left' ? 'borderTopRightRadius' : 'borderTopLeftRadius']: 3,
                [side === 'left' ? 'borderBottomRightRadius' : 'borderBottomLeftRadius']: 3,
              }
            ]} 
          />
        );
      })}
    </View>
  );
};

// 영수증 배경 컴포넌트
const ReceiptBackground: React.FC = () => {
  const scrollAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    // 지지직 거리며 출력되는 애니메이션 - 계속 반복
    const movements = [
      { distance: 15, duration: 150, pause: 100 },
      { distance: 20, duration: 180, pause: 120 },
      { distance: 12, duration: 140, pause: 80 },
      { distance: 18, duration: 160, pause: 150 },
      { distance: 25, duration: 200, pause: 130 },
      { distance: 16, duration: 155, pause: 90 },
      { distance: 22, duration: 190, pause: 110 },
      { distance: 14, duration: 145, pause: 100 },
    ];

    const receiptHeight = SCREEN_HEIGHT * 1.0;
    const stopPosition = SCREEN_HEIGHT * 0.55; // 상단 10% 지점

    const createSequence = () => {
      const sequence: any[] = [];
      let currentPos = SCREEN_HEIGHT;
      
      // 정지-이동 패턴 반복하며 상단 90% 지점까지 올리기
      while (currentPos > stopPosition) {
        movements.forEach(move => {
          if (currentPos > stopPosition) {
            currentPos -= move.distance;
            // stopPosition보다 낮아지지 않도록
            if (currentPos < stopPosition) {
              currentPos = stopPosition;
            }
            sequence.push(
              Animated.timing(scrollAnim, {
                toValue: currentPos,
                duration: move.duration,
                useNativeDriver: true,
              })
            );
            sequence.push(Animated.delay(move.pause));
          }
        });
      }

      // 상단에 도착하면 멈춤 (반복 없음)
      return sequence;
    };

    const animation = Animated.sequence(createSequence());

    animation.start();

    return () => {
      animation.stop();
    };
  }, []);

  const receiptWidth = SCREEN_WIDTH * 0.8;
  const receiptHeight = SCREEN_HEIGHT * 1.0;

  // 각 영수증마다 고유한 불규칙한 선 패턴 생성
  const receiptLines = Array.from({ length: Math.floor(receiptHeight / 12) }).map((_, i) => ({
    width: 50 + Math.random() * 45,
    opacity: 0.08 + Math.random() * 0.12,
    marginLeft: Math.random() * 10,
    height: Math.random() > 0.7 ? 3 : 2,
  }));

  return (
    <View style={styles.backgroundContainer}>
      <Animated.View
        style={[
          styles.receiptPaper,
          {
            transform: [{ translateY: scrollAnim }],
            left: '10%',
            width: receiptWidth,
            height: receiptHeight,
          },
        ]}>
        {/* 영수증 내용 - 희미하고 불규칙한 가로선들 */}
        <View style={styles.receiptContent}>
          {receiptLines.map((line, i) => (
            <View
              key={i}
              style={[
                styles.receiptLine,
                { 
                  width: `${line.width}%`,
                  opacity: line.opacity,
                  marginLeft: line.marginLeft,
                  height: line.height,
                },
              ]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

export const LoginScreen: React.FC = () => {
  const { signInWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // 각 글자별 애니메이션
  const letterAnims = useRef(
    'Momento.'.split('').map(() => new Animated.Value(0))
  ).current;
  const logoIconAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;
  const loginButtonAnim = useRef(new Animated.Value(0)).current;
  const disclaimerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 영수증이 정지하는 타이밍 계산
    const movements = [
      { distance: 15, duration: 150, pause: 100 },
      { distance: 20, duration: 180, pause: 120 },
      { distance: 12, duration: 140, pause: 80 },
      { distance: 18, duration: 160, pause: 150 },
      { distance: 25, duration: 200, pause: 130 },
      { distance: 16, duration: 155, pause: 90 },
      { distance: 22, duration: 190, pause: 110 },
      { distance: 14, duration: 145, pause: 100 },
    ];

    const stopPosition = SCREEN_HEIGHT * 0.55;
    let totalTime = 0;
    let currentPos = SCREEN_HEIGHT;

    // 정지 시점까지의 시간 계산
    while (currentPos > stopPosition) {
      movements.forEach(move => {
        if (currentPos > stopPosition) {
          currentPos -= move.distance;
          if (currentPos < stopPosition) {
            currentPos = stopPosition;
          }
          totalTime += move.duration + move.pause;
        }
      });
    }

    // 최초 시작 시에만 애니메이션 실행
    setTimeout(() => {
      // 1. Momento. 텍스트 애니메이션
      const letterAnimations = letterAnims.map((anim, index) => 
        Animated.sequence([
          Animated.delay(index * 100),
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      );

      Animated.parallel(letterAnimations).start(() => {
        // 2. Momento. 완성 후 나머지 모두 동시에 나타나기
        Animated.parallel([
          Animated.timing(logoIconAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(taglineAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(loginButtonAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(disclaimerAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, totalTime);
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ReceiptBackground />
      <View style={styles.content}>
        {/* Logo / Branding */}
        <View style={styles.brandingContainer}>
          <Animated.View 
            style={[
              styles.logoIcon,
              {
                opacity: logoIconAnim,
                transform: [
                  {
                    scale: logoIconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }
            ]}>
            <View style={styles.logoImageContainer}>
              <Image 
                source={require('../../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png')}
                style={styles.logoImage}
              />
            </View>
          </Animated.View>
          <View style={styles.logoTextContainer}>
            {'Momento.'.split('').map((letter, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.logo,
                  {
                    opacity: letterAnims[index],
                    transform: [
                      {
                        translateY: letterAnims[index].interpolate({
                          inputRange: [0, 1],
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}>
                {letter}
              </Animated.Text>
            ))}
          </View>
          <Animated.Text 
            style={[
              styles.tagline,
              {
                opacity: taglineAnim,
              }
            ]}>
            당신의 시간을 기록하세요
          </Animated.Text>
        </View>

        {/* Login Section */}
        <View style={styles.loginSection}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Animated.View
            style={{
              opacity: loginButtonAnim,
              transform: [
                {
                  translateY: loginButtonAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}>
            <TouchableOpacity
              style={[styles.googleButton, isLoading && styles.buttonDisabled]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              activeOpacity={0.8}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.textPrimary} />
              ) : (
                <Text style={styles.googleButtonText}>Google로 로그인</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.Text 
            style={[
              styles.disclaimer,
              {
                opacity: disclaimerAnim,
              }
            ]}>
            로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // 순수한 흰색
  },
  // 영수증 배경 스타일
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  receiptPaper: {
    position: 'absolute',
    backgroundColor: '#E5E7EB', // 더 연한 회색
    opacity: 0.5,
    overflow: 'hidden',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  jaggedEdge: {
    flexDirection: 'row',
    height: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'flex-end',
  },
  tooth: {
    backgroundColor: '#D1D5DB',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  jaggedEdgeVertical: {
    position: 'absolute',
    top: 10,
    width: 10,
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
  },
  toothVertical: {
    backgroundColor: '#D1D5DB',
  },
  receiptContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 24,
    gap: 8,
  },
  receiptLine: {
    backgroundColor: '#6B7280',
    borderRadius: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING['3xl'],
    zIndex: 1,
  },
  brandingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    marginTop: '-30%',
  },
  logoIcon: {
    marginBottom: 0,
  },
  logoImageContainer: {
    width: 170,
    height: 170,
  },
  logoImage: {
    width: 170,
    height: 170,
  },
  logoTextContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    zIndex: 10,
  },
  logo: {
    fontSize: 52,
    fontWeight: FONT_WEIGHTS.bold,
    fontFamily: FONTS.mono,
    color: '#1F2937',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray500,
    letterSpacing: 0.5,
  },
  loginSection: {
    paddingBottom: SPACING['2xl'],
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}20`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.base,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: SPACING.base,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.gray300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textPrimary,
  },
  disclaimer: {
    marginTop: SPACING.base,
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default LoginScreen;
