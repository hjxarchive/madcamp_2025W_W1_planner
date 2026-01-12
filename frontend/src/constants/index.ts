import { Platform } from 'react-native';

// API Configuration
// 서버는 Nginx 리버스 프록시를 통해 80 포트로 서비스됨
// 내부: NestJS (3000) -> 외부: Nginx (80)

const SERVER_IP = '172.10.5.61';

export const API_BASE_URL = `http://${SERVER_IP}/api`;  // Nginx 80 포트 (포트 생략)
// WebSocket은 socket.ts에서 API_BASE_URL 기반으로 자동 생성

// App Configuration
export const APP_NAME = 'Momento';
export const APP_VERSION = '1.0.0';

// Timer Constants
export const TIMER_INTERVAL = 1000; // 1 second
export const MAX_DAILY_GOAL_HOURS = 24;

// Colors - Momento Light Theme (웹앱과 동일)
export const COLORS = {
  // Primary colors (Momento Sky Blue)
  primary: '#7CB9E8',       // Momento blue
  primaryDark: '#5BA3D9',
  primaryLight: '#A8D8EA',
  
  // Background colors (Light theme)
  background: '#F9FAFB',    // gray-50
  surface: '#FFFFFF',       // white
  surfaceLight: '#F3F4F6',  // gray-100
  
  // Text colors
  textPrimary: '#111827',   // gray-900
  textSecondary: '#6B7280', // gray-500
  textMuted: '#9CA3AF',     // gray-400
  
  // Gray palette (Momento에서 사용)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  
  // Accent colors
  success: '#22C55E',       // Green-500
  warning: '#F59E0B',       // Amber-500
  error: '#EF4444',         // Red-500
  info: '#3B82F6',          // Blue-500
  
  // Project colors (pastel)
  pastelBlue: '#7CB9E8',
  pastelMint: '#B8E0D2',
  pastelPink: '#FFB6C1',
  pastelPeach: '#E8D5C4',
  pastelGreen: '#D6EADF',
  pastelPurple: '#BB8FCE',
  
  // Receipt colors (영수증 스타일)
  receiptBg: '#FFFEF5',     // 크림색 배경
  receiptText: '#1a1a1a',
  receiptBorder: '#E5E5E5',
  
  // Wave animation colors
  waveColor: '#7CB9E8',     // Momento blue
  waveBorder: '#7CB9E8',
  
  // Border
  border: '#E5E7EB',        // gray-200
  
  // Barcode colors
  barcodeActive: '#374151',  // gray-700
  barcodeInactive: '#F3F4F6', // gray-100
};

// Font families - Momento 스타일
export const FONTS = {
  // 기본 폰트 (본문용)
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }) as string,

  // 중간 굵기
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto',
  }) as string,

  // 굵은 폰트 (제목용)
  bold: Platform.select({
    ios: 'System',
    android: 'RobotoMono',
  }) as string,

  // 고정폭 폰트 (시간 표시용) - Roboto Mono
  mono: 'RobotoMono-Regular',
  monoMedium: 'RobotoMono-Medium',
  monoBold: 'RobotoMono-Bold',
};

// Font weights (Tailwind CSS 기준)
export const FONT_WEIGHTS = {
  light: '300' as const,
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Font sizes (Tailwind CSS 기준)
export const FONT_SIZES = {
  xs: 12,      // text-xs: 0.75rem = 12px
  sm: 14,      // text-sm: 0.875rem = 14px
  base: 16,    // text-base: 1rem = 16px
  md: 16,      // alias for base
  lg: 18,      // text-lg: 1.125rem = 18px
  xl: 20,      // text-xl: 1.25rem = 20px
  '2xl': 24,   // text-2xl: 1.5rem = 24px
  '3xl': 30,   // text-3xl: 1.875rem = 30px
  '4xl': 36,   // text-4xl: 2.25rem = 36px
  '5xl': 48,   // text-5xl: 3rem = 48px
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Animation durations
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// Tab names - Momento 탭 구조
export const TAB_NAMES = {
  MAIN: '메인',
  REPORT: '보고서',
  ARCHIVE: '아카이브',
};

// Task status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// Project types
export const PROJECT_TYPES = {
  PERSONAL: 'personal',
  TEAM: 'team',
};

// Time formatting helpers
export const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const formatTimeShort = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

export const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}.`;
};

export const getDayName = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(date).getDay()];
};
