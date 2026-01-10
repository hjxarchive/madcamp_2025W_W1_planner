// API Configuration
export const API_BASE_URL = 'https://momento.dawoony.com/api';
export const WS_URL = 'wss://momento.dawoony.com';

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

// Font sizes
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
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
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const formatDate = (date: Date): string => {
  const d = new Date(date);
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}.`;
};

export const getDayName = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[new Date(date).getDay()];
};
