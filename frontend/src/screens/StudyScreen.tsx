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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime, formatTimeShort, formatDate } from '@constants/index';
import { api } from '@services/api';
import type { DailyArchive } from '../types';

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

interface Task {
  taskName: string;
  projectName: string;
  durationMs: number;
}

interface TimeSlot {
  active: boolean;
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

const generateWeeklyData = (): DailyArchive[] => {
  const today = new Date();
  const weekData: DailyArchive[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const hasData = Math.random() > 0.3;
    const tasks: Task[] = hasData ? [
      { taskName: '알고리즘 문제 풀기', projectName: '코딩테스트', durationMs: 3600000 + Math.random() * 3600000 },
      { taskName: '강의 노트 정리', projectName: '자료구조', durationMs: 1800000 + Math.random() * 1800000 },
      { taskName: '프로젝트 회의', projectName: '팀프로젝트', durationMs: 2400000 + Math.random() * 1200000 },
    ] : [];
    
    const timeSlots: TimeSlot[] = Array.from({ length: 24 }, () => ({
      active: hasData && Math.random() > 0.5,
    }));
    
    weekData.push({
      date,
      tasks,
      totalTimeMs: tasks.reduce((sum, t) => sum + t.durationMs, 0),
      timeSlots,
      recordedAt: hasData ? new Date() : undefined,
    });
  }
  
  return weekData;
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

const BarcodeTimeline: React.FC<{ timeSlots: TimeSlot[] }> = ({ timeSlots }) => (
  <View style={barcodeStyles.container}>
    {timeSlots.map((slot, i) => (
      <View
        key={i}
        style={[
          barcodeStyles.bar,
          {
            height: slot.active ? 24 + Math.random() * 16 : 8,
            backgroundColor: slot.active ? COLORS.gray900 : COLORS.gray200,
          },
        ]}
      />
    ))}
  </View>
);

const barcodeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 48,
    justifyContent: 'space-between',
    marginHorizontal: SPACING.md,
  },
  bar: {
    width: (SCREEN_WIDTH * 0.7) / 24 - 2,
    borderRadius: 1,
  },
});

/**
 * 서버에서 생성된 이미지를 표시하는 영수증 카드
 */
const ReceiptImageCard: React.FC<{
  data: ReceiptCardData;
  nickname: string;
  onGenerateImage: () => void;
  onDownload?: () => void;
}> = ({ data, nickname, onGenerateImage, onDownload }) => {
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
  
  const days = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    hasData: Math.random() > 0.3,
    intensity: Math.random(),
    timeMs: Math.floor(Math.random() * 36000000),
  }));
  
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
              {days.map(({ day, hasData, intensity }) => {
                const isSelected = selectedDay === day;
                const isToday = day === todayDate;
                return (
                  <TouchableOpacity key={day} style={[monthlyStyles.dayCell, isSelected && monthlyStyles.dayCellSelected, isToday && !isSelected && monthlyStyles.dayCellToday]} onPress={() => { setSelectedDay(day); onSelectDate(new Date(year, month, day)); }}>
                    <Text style={[monthlyStyles.dayText, isSelected && monthlyStyles.dayTextSelected, isToday && !isSelected && monthlyStyles.dayTextToday]}>{day}</Text>
                    {hasData && !isSelected && <View style={[monthlyStyles.activityDot, { opacity: 0.3 + intensity * 0.7 }]} />}
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
  activityDot: { width: 4, height: 8, backgroundColor: COLORS.gray400, borderRadius: 2, marginTop: 2 },
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
  const [nickname, setNickname] = useState('사용자');
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const flatListRef = useRef<FlatList>(null);
  
  // API에서 주간 데이터 로드
  const loadWeeklyData = useCallback(async () => {
    try {
      // 사용자 정보 조회
      const userRes = await api.getMe();
      if (userRes.data) {
        setNickname(userRes.data.nickname);
      }
      
      // 영수증 목록 조회 (지난 7일치)
      const receiptsRes = await api.getReceipts(1, 7);
      
      // 주간 데이터 생성
      const today = new Date();
      const weekly: ReceiptCardData[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        // 영수증 데이터에서 해당 날짜 찾기
        const receipt = receiptsRes.data?.data?.find(r => r.date === dateStr);
        
        weekly.push({
          date,
          dateStr,
          imageUrl: receipt?.imageUrl || null,
          totalMinutes: receipt?.totalMinutes || 0,
          isLoading: false,
        });
      }
      
      setWeeklyData(weekly);
    } catch (error) {
      console.error('주간 데이터 로드 실패:', error);
      // 실패 시 빈 데이터로 초기화
      const today = new Date();
      const emptyWeekly: ReceiptCardData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        emptyWeekly.push({ date, dateStr, imageUrl: null, totalMinutes: 0, isLoading: false });
      }
      setWeeklyData(emptyWeekly);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
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
  
  useEffect(() => { loadWeeklyData(); }, [loadWeeklyData]);
  
  const totalWeekTime = weeklyData.reduce((sum, d) => sum + d.totalMinutes * 60 * 1000, 0);
  
  const onRefresh = async () => { 
    setRefreshing(true); 
    await loadWeeklyData(); 
    setRefreshing(false); 
  };
  
  const scrollToIndex = (index: number) => { 
    flatListRef.current?.scrollToIndex({ index, animated: true }); 
    setCurrentIndex(index); 
  };
  
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    if (idx !== currentIndex && idx >= 0 && idx < weeklyData.length) setCurrentIndex(idx);
  };
  
  const handleDownload = useCallback((index: number) => {
    const data = weeklyData[index];
    if (data?.imageUrl) {
      const fullUrl = `${getImageBaseUrl()}${data.imageUrl}`;
      Alert.alert('다운로드', `이미지 URL: ${fullUrl}\n\n(갤러리 저장 기능은 추후 구현 예정)`);
    }
  }, [weeklyData]);
  
  if (showMonthly) return <SafeAreaView style={styles.container} edges={['top']}><MonthlyArchivePage onBack={() => setShowMonthly(false)} onSelectDate={() => setShowMonthly(false)} /></SafeAreaView>;
  
  if (isLoading || weeklyData.length === 0) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.loading}><ActivityIndicator size="large" color={COLORS.gray900} /><Text style={styles.loadingText}>로딩 중...</Text></View></SafeAreaView>;
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>주간 아카이브</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.scrollView} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>이번 주 총 시간</Text>
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
          scrollEventThrottle={16}
          renderItem={({ item, index }) => (
            <ReceiptImageCard 
              data={item} 
              nickname={nickname} 
              onGenerateImage={() => handleGenerateImage(index)}
              onDownload={() => handleDownload(index)} 
            />
          )}
          keyExtractor={(_, index) => index.toString()}
          getItemLayout={(_, index) => ({ length: CARD_WIDTH + CARD_GAP, offset: (CARD_WIDTH + CARD_GAP) * index, index })}
          initialScrollIndex={6}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  headerTitle: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.gray900 },
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
