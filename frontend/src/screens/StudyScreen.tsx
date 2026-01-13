import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import RNFS from 'react-native-fs';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime } from '@constants/index';
import { api } from '@services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_GAP = 16;

// 서버 Base URL (이미지 URL 생성용)
const getImageBaseUrl = () => {
  // API_BASE_URL에서 /api 부분 제거
  const baseUrl = 'http://172.10.5.61'; // 서버 IP
  return baseUrl;
};

interface ReceiptCardData {
  date: Date;
  dateStr: string;
  imageUrl: string | null;
  totalMinutes: number;
  isLoading: boolean;
}

const getDayName = (date: Date): string => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

const formatDateFull = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateShort = (date: Date): string => {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`;
};

const DashedLine: React.FC = () => (
  <View style={dashStyles.container}>
    {Array.from({ length: 40 }).map((_, i) => (
      <View key={i} style={dashStyles.dash} />
    ))}
  </View>
);

const dashStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  dash: {
    width: 6,
    height: 1,
    backgroundColor: COLORS.gray300,
  },
});

/**
 * 서버에서 생성된 이미지를 표시하는 영수증 카드
 */
const ReceiptImageCard: React.FC<{
  data: ReceiptCardData;
  onGenerateImage: () => void;
  onDownload?: () => void;
}> = ({ data, onGenerateImage, onDownload }) => {
  const imageUrl = data.imageUrl ? `${getImageBaseUrl()}${data.imageUrl}` : null;

  return (
    <View style={receiptStyles.cardWrapper}>
      <View style={receiptStyles.card}>
        {data.isLoading ? (
          // 로딩 상태
          <View style={receiptStyles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.gray900} />
            <Text style={receiptStyles.loadingText}>영수증 생성 중...</Text>
          </View>
        ) : imageUrl ? (
          // 이미지가 있는 경우
          <Image
            source={{ uri: imageUrl }}
            style={receiptStyles.receiptImage}
            resizeMode="contain"
          />
        ) : (
          // 이미지가 없는 경우 - 생성 버튼 표시
          <View style={receiptStyles.noImageContainer}>
            <View style={receiptStyles.noImageIcon}>
              <Icon name="receipt" size={48} color={COLORS.gray400} />
            </View>
            <Text style={receiptStyles.noImageTitle}>
              {formatDateFull(data.date)} ({getDayName(data.date)})
            </Text>
            <Text style={receiptStyles.noImageSubtitle}>
              {data.totalMinutes > 0
                ? `총 ${formatTime(data.totalMinutes * 60 * 1000)} 기록됨`
                : '기록된 시간이 없습니다'}
            </Text>
            {data.totalMinutes > 0 && (
              <TouchableOpacity
                style={receiptStyles.generateButton}
                onPress={onGenerateImage}
              >
                <Icon name="image-plus" size={20} color="#fff" />
                <Text style={receiptStyles.generateButtonText}>영수증 생성</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      {/* 다운로드 버튼 (이미지가 있을 때만) */}
      {imageUrl && onDownload && (
        <TouchableOpacity style={receiptStyles.downloadButton} onPress={onDownload}>
          <Icon name="download" size={18} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* 새로고침 버튼 (이미지가 있을 때) */}
      {imageUrl && (
        <TouchableOpacity 
          style={receiptStyles.refreshButton} 
          onPress={onGenerateImage}
        >
          <Icon name="refresh" size={18} color={COLORS.gray600} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const receiptStyles = StyleSheet.create({
  cardWrapper: { width: CARD_WIDTH, marginHorizontal: CARD_GAP / 2, position: 'relative' },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: BORDER_RADIUS.lg, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3,
    minHeight: 500,
    overflow: 'hidden',
  },
  // 영수증 이미지
  receiptImage: {
    width: '100%',
    height: 700,
    borderRadius: BORDER_RADIUS.lg,
  },
  // 로딩 상태
  loadingContainer: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray600,
  },
  // 이미지 없을 때
  noImageContainer: {
    flex: 1,
    minHeight: 500,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  noImageIcon: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.gray100,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  noImageTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  noImageSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
    marginBottom: SPACING.xl,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray900,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  generateButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: '#fff',
  },
  // 버튼들
  downloadButton: { 
    position: 'absolute', 
    top: SPACING.base, 
    right: SPACING.base, 
    width: 36, 
    height: 36, 
    backgroundColor: COLORS.gray900, 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 4, 
    elevation: 4,
  },
  refreshButton: { 
    position: 'absolute', 
    top: SPACING.base, 
    right: SPACING.base + 44, 
    width: 36, 
    height: 36, 
    backgroundColor: '#fff', 
    borderRadius: 18, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
});

const MonthlyArchivePage: React.FC<{ onBack: () => void; onSelectDate: (date: Date) => void }> = ({ onBack, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const firstDayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : null;
  
  return (
    <View style={monthlyStyles.container}>
      <View style={monthlyStyles.header}>
        <TouchableOpacity onPress={onBack}><Icon name="chevron-left" size={24} color={COLORS.gray600} /></TouchableOpacity>
        <Text style={monthlyStyles.headerTitle}>월간 아카이브</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={monthlyStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={monthlyStyles.calendarCard}>
          <View style={monthlyStyles.logoContainer}>
            <View style={monthlyStyles.logo}><Icon name="calendar" size={24} color="#fff" /></View>
          </View>
          
          <View style={monthlyStyles.monthSelector}>
            <TouchableOpacity onPress={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(1); }} style={monthlyStyles.monthButton}><Icon name="chevron-left" size={20} color={COLORS.gray600} /></TouchableOpacity>
            <Text style={monthlyStyles.monthText}>{year}년 {month + 1}월</Text>
            <TouchableOpacity onPress={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(1); }} style={monthlyStyles.monthButton}><Icon name="chevron-right" size={20} color={COLORS.gray600} /></TouchableOpacity>
          </View>
          
          <DashedLine />
          
          <View style={monthlyStyles.calendar}>
            <View style={monthlyStyles.dayHeaders}>
              {['월', '화', '수', '목', '금', '토', '일'].map((day, i) => (
                <Text key={day} style={[monthlyStyles.dayHeader, i === 5 && { color: '#60A5FA' }, i === 6 && { color: '#F87171' }]}>{day}</Text>
              ))}
            </View>
            
            <View style={monthlyStyles.calendarGrid}>
              {Array.from({ length: firstDayOffset }).map((_, i) => (<View key={`empty-${i}`} style={monthlyStyles.dayCell} />))}
              {days.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = day === todayDate;
                return (
                  <TouchableOpacity key={day} style={[monthlyStyles.dayCell, isSelected && monthlyStyles.dayCellSelected, isToday && !isSelected && monthlyStyles.dayCellToday]} onPress={() => { setSelectedDay(day); onSelectDate(new Date(year, month, day)); }}>
                    <Text style={[monthlyStyles.dayText, isSelected && monthlyStyles.dayTextSelected, isToday && !isSelected && monthlyStyles.dayTextToday]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
          
          <DashedLine />
          
          <View style={monthlyStyles.selectedInfo}>
            <Text style={monthlyStyles.selectedDate}>{year}년 {month + 1}월 {selectedDay}일</Text>
            <Text style={monthlyStyles.selectedTime}>{formatTime(days[selectedDay - 1]?.timeMs || 0)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const monthlyStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.gray900 },
  scrollView: { flex: 1, paddingHorizontal: SPACING.base, paddingTop: SPACING.xl },
  calendarCard: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 100 },
  logoContainer: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.sm },
  logo: { width: 48, height: 48, backgroundColor: COLORS.gray900, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] },
  monthSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.base, gap: SPACING.xl },
  monthButton: { padding: SPACING.sm },
  monthText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.gray900 },
  calendar: { paddingHorizontal: SPACING.base, paddingVertical: SPACING.base },
  dayHeaders: { flexDirection: 'row', marginBottom: SPACING.sm },
  dayHeader: { flex: 1, textAlign: 'center', fontSize: FONT_SIZES.xs, fontWeight: '500', color: COLORS.gray500, paddingVertical: SPACING.xs },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', padding: 2 },
  dayCellSelected: { backgroundColor: COLORS.gray900, borderRadius: BORDER_RADIUS.md },
  dayCellToday: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#BFDBFE', borderRadius: BORDER_RADIUS.md },
  dayText: { fontSize: FONT_SIZES.xs, color: COLORS.gray700 },
  dayTextSelected: { color: '#fff', fontWeight: 'bold' },
  dayTextToday: { color: '#1D4ED8', fontWeight: '500' },
  selectedInfo: { alignItems: 'center', paddingVertical: SPACING.xl },
  selectedDate: { fontSize: FONT_SIZES.base, color: COLORS.gray600, marginBottom: SPACING.sm },
  selectedTime: { fontSize: FONT_SIZES['2xl'], fontWeight: 'bold', color: COLORS.gray900 },
});

export const StudyScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState<ReceiptCardData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(6);
  const [showMonthly, setShowMonthly] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // 탭 포커스 시 오늘 날짜로 스크롤 (현재 주에서 오늘에 해당하는 인덱스)
  useFocusEffect(
    useCallback(() => {
      const today = new Date();
      const day = today.getDay(); // 0(일) ~ 6(토)
      // 월요일=0, 화요일=1, ..., 일요일=6
      const todayIndex = day === 0 ? 6 : day - 1;
      setCurrentIndex(todayIndex);
      flatListRef.current?.scrollToIndex({ index: todayIndex, animated: false });
    }, [])
  );

  /**
   * 주어진 기준일을 포함한 주의 월요일~일요일 날짜 배열 반환
   */
  const getWeekDates = useCallback((referenceDate: Date): Date[] => {
    const result: Date[] = [];
    const day = referenceDate.getDay(); // 0(일) ~ 6(토)
    // 월요일 찾기: 일요일이면 -6, 그 외에는 -(day-1)
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(referenceDate);
    monday.setDate(referenceDate.getDate() + mondayOffset);

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      result.push(date);
    }
    return result;
  }, []);

  // 현재 주의 기준일 (주차 전환 시 변경)
  const [currentWeekReference, setCurrentWeekReference] = useState(new Date());

  // API에서 주간 데이터 로드
  const loadWeeklyData = useCallback(async (referenceDate?: Date) => {
    const refDate = referenceDate || currentWeekReference;
    try {
      // 해당 주의 월~일 날짜 배열 생성
      const weekDates = getWeekDates(refDate);

      // 각 날짜에 대해 영수증 상세 정보 조회 (병렬 처리)
      const detailsPromises = weekDates.map(date => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return api.getReceiptDetails(dateStr);
      });

      const detailsResults = await Promise.all(detailsPromises);

      // 주간 데이터 생성
      const weekly: ReceiptCardData[] = weekDates.map((date, index) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        const details = detailsResults[index];

        return {
          date,
          dateStr,
          imageUrl: details.data?.imageUrl || null,
          totalMinutes: details.data?.totalMinutes || 0,
          isLoading: false,
        };
      });

      setWeeklyData(weekly);

      // 오늘이 현재 주에 포함되어 있으면 오늘로 스크롤
      const today = new Date();
      const todayDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const todayIndex = weekly.findIndex(d => d.dateStr === todayDateStr);
      if (todayIndex >= 0) {
        setCurrentIndex(todayIndex);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: todayIndex, animated: false });
        }, 100);
      } else {
        setCurrentIndex(6); // 일요일
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: 6, animated: false });
        }, 100);
      }
    } catch (error) {
      console.error('주간 데이터 로드 실패:', error);
      // 실패 시 빈 데이터로 초기화
      const weekDates = getWeekDates(refDate);
      const emptyWeekly: ReceiptCardData[] = weekDates.map(date => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        return { date, dateStr, imageUrl: null, totalMinutes: 0, isLoading: false };
      });
      setWeeklyData(emptyWeekly);
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekReference, getWeekDates]);
  
  // 영수증 이미지 생성
  const handleGenerateImage = useCallback(async (index: number) => {
    const data = weeklyData[index];
    if (!data) return;
    
    // 로딩 상태 설정
    setWeeklyData(prev => prev.map((item, i) => 
      i === index ? { ...item, isLoading: true } : item
    ));
    setGeneratingIndex(index);
    
    try {
      const response = await api.generateReceiptImage(data.dateStr);
      
      if (response.data) {
        // 이미지 URL 업데이트
        setWeeklyData(prev => prev.map((item, i) => 
          i === index ? { 
            ...item, 
            imageUrl: response.data!.imageUrl, 
            totalMinutes: response.data!.totalMinutes,
            isLoading: false 
          } : item
        ));
        Alert.alert('완료', '영수증 이미지가 생성되었습니다.');
      } else {
        throw new Error(response.error || '이미지 생성 실패');
      }
    } catch (error) {
      console.error('영수증 이미지 생성 실패:', error);
      Alert.alert('오류', '영수증 이미지 생성에 실패했습니다.');
      // 로딩 상태 해제
      setWeeklyData(prev => prev.map((item, i) => 
        i === index ? { ...item, isLoading: false } : item
      ));
    } finally {
      setGeneratingIndex(null);
    }
  }, [weeklyData]);
  
  // 주차 변경 시 데이터 다시 로드
  useEffect(() => { loadWeeklyData(currentWeekReference); }, [currentWeekReference]);

  // 이전 주차로 이동
  const goToPreviousWeek = useCallback(() => {
    setIsLoading(true);
    const prevWeek = new Date(currentWeekReference);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekReference(prevWeek);
  }, [currentWeekReference]);

  // 다음 주차로 이동
  const goToNextWeek = useCallback(() => {
    setIsLoading(true);
    const nextWeek = new Date(currentWeekReference);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekReference(nextWeek);
  }, [currentWeekReference]);

  // 이번 주로 이동
  const goToCurrentWeek = useCallback(() => {
    setIsLoading(true);
    setCurrentWeekReference(new Date());
  }, []);

  const totalWeekTime = weeklyData.reduce((sum, d) => sum + d.totalMinutes * 60 * 1000, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeeklyData(currentWeekReference);
    setRefreshing(false);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
  };

  // 스크롤 끝 감지를 위한 상태
  const [isScrollingForWeekChange, setIsScrollingForWeekChange] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const idx = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    if (idx !== currentIndex && idx >= 0 && idx < weeklyData.length) setCurrentIndex(idx);
  };

  // 스크롤이 끝에 도달했을 때 주차 전환
  const handleScrollEndDrag = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const contentWidth = (CARD_WIDTH + CARD_GAP) * weeklyData.length;
    const viewWidth = SCREEN_WIDTH;

    // 왼쪽 끝에서 더 스크롤 시 (offset이 음수)
    if (offsetX < -50 && !isScrollingForWeekChange) {
      setIsScrollingForWeekChange(true);
      goToPreviousWeek();
      setTimeout(() => setIsScrollingForWeekChange(false), 500);
    }
    // 오른쪽 끝에서 더 스크롤 시
    else if (offsetX > contentWidth - viewWidth + 50 && !isScrollingForWeekChange) {
      setIsScrollingForWeekChange(true);
      goToNextWeek();
      setTimeout(() => setIsScrollingForWeekChange(false), 500);
    }
  };

  // 월간 아카이브에서 날짜 선택 시 해당 주차로 이동
  const [pendingScrollDate, setPendingScrollDate] = useState<Date | null>(null);

  const handleSelectDate = useCallback((selectedDate: Date) => {
    // 선택된 날짜의 주차로 이동
    setIsLoading(true);
    setPendingScrollDate(selectedDate);
    setCurrentWeekReference(selectedDate);
    setShowMonthly(false);
  }, []);

  // 주간 데이터 로드 후 선택된 날짜로 스크롤
  useEffect(() => {
    if (pendingScrollDate && weeklyData.length > 0) {
      const dateStr = formatDateFull(pendingScrollDate);
      const targetIndex = weeklyData.findIndex(d => d.dateStr === dateStr);

      if (targetIndex >= 0) {
        setCurrentIndex(targetIndex);
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
        }, 100);
      }
      setPendingScrollDate(null);
    }
  }, [weeklyData, pendingScrollDate]);
  
  // Android 권한 요청
  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      // Android 13 (API 33) 이상에서는 MediaStore API 사용으로 저장 권한 불필요
      if (Platform.Version >= 33) {
        return true;
      } else if (Platform.Version >= 29) {
        // Android 10-12: scoped storage로 권한 불필요
        return true;
      } else {
        // Android 9 이하에서는 WRITE_EXTERNAL_STORAGE 권한 필요
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '저장소 접근 권한',
            message: '영수증 이미지를 갤러리에 저장하려면 저장소 접근 권한이 필요합니다.',
            buttonNeutral: '나중에',
            buttonNegative: '거부',
            buttonPositive: '허용',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.error('권한 요청 실패:', err);
      // 권한 오류 발생 시에도 저장 시도 허용 (MediaStore가 처리)
      return true;
    }
  };

  // 갤러리에 이미지 저장
  const handleDownload = useCallback(async (index: number) => {
    const data = weeklyData[index];
    if (!data?.imageUrl) {
      Alert.alert('알림', '저장할 이미지가 없습니다.');
      return;
    }

    try {
      // 권한 확인
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert('권한 필요', '갤러리에 이미지를 저장하려면 저장소 접근 권한이 필요합니다.');
        return;
      }

      // 이미지 URL
      const fullUrl = `${getImageBaseUrl()}${data.imageUrl}`;
      const filename = `momento_receipt_${data.dateStr}.png`;
      const localPath = `${RNFS.CachesDirectoryPath}/${filename}`;

      // 로딩 표시
      Alert.alert('다운로드 중', '이미지를 저장하고 있습니다...');

      // 이미지 다운로드
      const downloadResult = await RNFS.downloadFile({
        fromUrl: fullUrl,
        toFile: localPath,
      }).promise;

      if (downloadResult.statusCode !== 200) {
        throw new Error('이미지 다운로드 실패');
      }

      // 갤러리에 저장
      await CameraRoll.saveAsset(`file://${localPath}`, { type: 'photo', album: 'Momento' });

      // 캐시 파일 삭제
      await RNFS.unlink(localPath);

      Alert.alert('완료', '영수증 이미지가 갤러리에 저장되었습니다.');
    } catch (error) {
      console.error('이미지 저장 실패:', error);
      Alert.alert('오류', '이미지 저장에 실패했습니다. 다시 시도해주세요.');
    }
  }, [weeklyData]);
  
  if (showMonthly) return <SafeAreaView style={styles.container} edges={['top']}><MonthlyArchivePage onBack={() => setShowMonthly(false)} onSelectDate={handleSelectDate} /></SafeAreaView>;
  
  if (isLoading || weeklyData.length === 0) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.loading}><ActivityIndicator size="large" color={COLORS.gray900} /><Text style={styles.loadingText}>로딩 중...</Text></View></SafeAreaView>;
  
  // 현재 주인지 확인
  const isCurrentWeek = (() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return weeklyData.some(d => d.dateStr === todayStr);
  })();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousWeek} style={styles.headerButton}>
          <Icon name="chevron-left" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToCurrentWeek} disabled={isCurrentWeek}>
          <Text style={[styles.headerTitle, !isCurrentWeek && styles.headerTitleClickable]}>
            주간 아카이브 {!isCurrentWeek && '(이번 주로)'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goToNextWeek} style={styles.headerButton}>
          <Icon name="chevron-right" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              {isCurrentWeek ? '이번 주 총 시간' : `${weeklyData[0].date.getMonth() + 1}월 ${weeklyData[0].date.getDate()}일 주간`}
            </Text>
            <Text style={styles.summaryValue}>{formatTime(totalWeekTime)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summarySubLabel}>{formatDateShort(weeklyData[0].date)} ~ {formatDateShort(weeklyData[6].date)}</Text>
            <Text style={styles.summarySubLabel}>일 평균 {formatTime(Math.floor(totalWeekTime / 7))}</Text>
          </View>
        </View>

        <View style={styles.dateNav}>
          {weeklyData.map((day, index) => (
            <TouchableOpacity key={index} onPress={() => scrollToIndex(index)} style={[styles.dateNavItem, currentIndex === index && styles.dateNavItemActive]}>
              <Text style={[styles.dateNavDay, currentIndex === index && styles.dateNavTextActive]}>{getDayName(day.date)}</Text>
              <Text style={[styles.dateNavDate, currentIndex === index && styles.dateNavTextActive]}>{day.date.getDate()}</Text>
              {day.totalMinutes > 0 && currentIndex !== index && <View style={styles.dateNavDot} />}
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          ref={flatListRef}
          data={weeklyData}
          horizontal
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContent}
          onScroll={handleScroll}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          bounces={true}
          renderItem={({ item, index }) => (
            <ReceiptImageCard
              data={item}
              onGenerateImage={() => handleGenerateImage(index)}
              onDownload={() => handleDownload(index)}
            />
          )}
          keyExtractor={(item) => item.dateStr}
          getItemLayout={(_, index) => ({ length: CARD_WIDTH + CARD_GAP, offset: (CARD_WIDTH + CARD_GAP) * index, index })}
          onScrollToIndexFailed={() => {}}
        />
        
        <View style={styles.pageIndicators}>
          {weeklyData.map((_, index) => (
            <TouchableOpacity key={index} onPress={() => scrollToIndex(index)} style={[styles.pageIndicator, currentIndex === index && styles.pageIndicatorActive]} />
          ))}
        </View>
        
        <View style={styles.bottomButtons}>
          <TouchableOpacity 
            style={[styles.primaryButton, (!weeklyData[currentIndex]?.imageUrl || generatingIndex !== null) && styles.buttonDisabled]} 
            onPress={() => handleDownload(currentIndex)}
            disabled={!weeklyData[currentIndex]?.imageUrl || generatingIndex !== null}
          >
            <Icon name="download" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>현재 영수증 이미지 저장</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowMonthly(true)}>
            <Icon name="calendar" size={18} color={COLORS.gray700} />
            <Text style={styles.secondaryButtonText}>월간 아카이브 보기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  headerButton: { padding: SPACING.sm },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.gray900 },
  headerTitleClickable: { color: COLORS.primary },
  scrollView: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.md },
  loadingText: { fontSize: FONT_SIZES.base, color: COLORS.gray500 },
  summaryContainer: { backgroundColor: '#fff', paddingHorizontal: SPACING.base, paddingVertical: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm },
  summaryLabel: { fontSize: FONT_SIZES.sm, color: COLORS.gray600 },
  summaryValue: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.gray900 },
  summarySubLabel: { fontSize: FONT_SIZES.xs, color: COLORS.gray500 },
  dateNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  dateNavItem: { alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: SPACING.xs, borderRadius: BORDER_RADIUS.lg },
  dateNavItemActive: { backgroundColor: COLORS.gray900 },
  dateNavDay: { fontSize: FONT_SIZES.xs, color: COLORS.gray600 },
  dateNavDate: { fontSize: FONT_SIZES.sm, fontWeight: '500', color: COLORS.gray600 },
  dateNavTextActive: { color: '#fff' },
  dateNavDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gray400, marginTop: 2 },
  carouselContent: { paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2 - CARD_GAP / 2, paddingVertical: SPACING.xl },
  pageIndicators: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: SPACING.sm, gap: 6 },
  pageIndicator: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.gray300 },
  pageIndicatorActive: { width: 24, backgroundColor: COLORS.gray900 },
  bottomButtons: { paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: 100, gap: SPACING.sm },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.gray900, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl, gap: SPACING.sm },
  primaryButtonText: { fontSize: FONT_SIZES.base, fontWeight: '500', color: '#fff' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl, borderWidth: 1, borderColor: COLORS.gray300, gap: SPACING.sm },
  secondaryButtonText: { fontSize: FONT_SIZES.base, fontWeight: '500', color: COLORS.gray700 },
  buttonDisabled: { backgroundColor: COLORS.gray400, opacity: 0.7 },
});

export default StudyScreen;
