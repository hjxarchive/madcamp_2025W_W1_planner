import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, formatTime, formatTimeShort, formatDate } from '@constants/index';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_GAP = 16;

interface Task {
  taskName: string;
  projectName: string;
  durationMs: number;
}

interface TimeSlot {
  active: boolean;
}

interface DailyArchive {
  date: Date;
  tasks: Task[];
  totalTimeMs: number;
  timeSlots: TimeSlot[];
  recordedAt?: Date;
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

const ReceiptCard: React.FC<{
  archive: DailyArchive;
  nickname: string;
  onDownload?: () => void;
}> = ({ archive, nickname, onDownload }) => {
  return (
    <View style={receiptStyles.cardWrapper}>
      <View style={receiptStyles.card}>
        <View style={receiptStyles.logoContainer}>
          <View style={receiptStyles.logo}>
            <Icon name="clock-outline" size={24} color="#fff" />
          </View>
        </View>
        
        <View style={receiptStyles.titleSection}>
          <Text style={receiptStyles.title}>{nickname}'s Momento</Text>
          <Text style={receiptStyles.subtitle}>
            {formatDate(archive.date)} ({getDayName(archive.date)})
          </Text>
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.row}>
          <Text style={receiptStyles.rowLabel}>기록 일시</Text>
          <Text style={receiptStyles.rowValue}>
            {archive.recordedAt
              ? `${formatDateFull(archive.date)} ${String(archive.recordedAt.getHours()).padStart(2, '0')}:${String(archive.recordedAt.getMinutes()).padStart(2, '0')}:${String(archive.recordedAt.getSeconds()).padStart(2, '0')}`
              : `${formatDateFull(archive.date)} 23:59:59`
            }
          </Text>
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.taskHeader}>
          <Text style={[receiptStyles.taskHeaderText, { flex: 1 }]}>Task명</Text>
          <Text style={[receiptStyles.taskHeaderText, { width: 60, textAlign: 'center' }]}>프로젝트</Text>
          <Text style={[receiptStyles.taskHeaderText, { width: 70, textAlign: 'right' }]}>소요시간</Text>
        </View>
        
        <View style={receiptStyles.dashedBorder} />
        
        <View style={receiptStyles.taskList}>
          {archive.tasks.length > 0 ? (
            archive.tasks.map((task, i) => (
              <View key={i} style={receiptStyles.taskRow}>
                <Text style={[receiptStyles.taskName, { flex: 1 }]} numberOfLines={1}>{task.taskName}</Text>
                <Text style={[receiptStyles.taskProject, { width: 60, textAlign: 'center' }]} numberOfLines={1}>{task.projectName}</Text>
                <Text style={[receiptStyles.taskDuration, { width: 70, textAlign: 'right' }]}>{formatTimeShort(task.durationMs)}</Text>
              </View>
            ))
          ) : (
            <View style={receiptStyles.emptyTasks}>
              <Text style={receiptStyles.emptyText}>기록된 Task가 없습니다</Text>
            </View>
          )}
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.row}>
          <Text style={receiptStyles.rowLabel}>합계</Text>
          <Text style={receiptStyles.totalValue}>{formatTime(archive.totalTimeMs)}</Text>
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.detailsSection}>
          <Text style={receiptStyles.detailsTitle}>[상세 내역]</Text>
          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.rowLabel}>완료 Task</Text>
            <Text style={receiptStyles.rowValue}>{archive.tasks.length}개</Text>
          </View>
          <View style={receiptStyles.detailRow}>
            <Text style={receiptStyles.rowLabel}>평균 소요시간</Text>
            <Text style={receiptStyles.rowValue}>{formatTimeShort(Math.floor(archive.totalTimeMs / Math.max(archive.tasks.length, 1)))}</Text>
          </View>
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.grandTotal}>
          <Text style={receiptStyles.grandTotalLabel}>총 소요시간</Text>
          <Text style={receiptStyles.grandTotalValue}>{formatTime(archive.totalTimeMs)}</Text>
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.barcodeSection}>
          <Text style={receiptStyles.barcodeTitle}>[24시간 타임라인]</Text>
          <BarcodeTimeline timeSlots={archive.timeSlots} />
          <View style={receiptStyles.barcodeLabels}>
            <Text style={receiptStyles.barcodeLabel}>00:00</Text>
            <Text style={receiptStyles.barcodeLabel}>06:00</Text>
            <Text style={receiptStyles.barcodeLabel}>12:00</Text>
            <Text style={receiptStyles.barcodeLabel}>18:00</Text>
            <Text style={receiptStyles.barcodeLabel}>24:00</Text>
          </View>
        </View>
        
        <DashedLine />
        
        <View style={receiptStyles.footer}>
          <Text style={receiptStyles.footerText}>오늘도 수고하셨습니다 :)</Text>
          <Text style={receiptStyles.footerSubtext}>• 내일도 화이팅!</Text>
          <Text style={receiptStyles.footerSubtext}>• Keep tracking your time</Text>
        </View>
        
        <View style={receiptStyles.footerGradient} />
      </View>
      
      {onDownload && (
        <TouchableOpacity style={receiptStyles.downloadButton} onPress={onDownload}>
          <Icon name="download" size={18} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const receiptStyles = StyleSheet.create({
  cardWrapper: { width: CARD_WIDTH, marginHorizontal: CARD_GAP / 2 },
  card: { backgroundColor: '#fff', borderRadius: BORDER_RADIUS.lg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  logoContainer: { alignItems: 'center', paddingTop: SPACING.xl, paddingBottom: SPACING.sm },
  logo: { width: 48, height: 48, backgroundColor: COLORS.gray900, borderRadius: BORDER_RADIUS.lg, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '12deg' }] },
  titleSection: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingBottom: SPACING.base },
  title: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.gray900 },
  subtitle: { fontSize: FONT_SIZES.sm, color: COLORS.gray500, marginTop: SPACING.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  rowLabel: { fontSize: FONT_SIZES.sm, color: COLORS.gray600 },
  rowValue: { fontSize: FONT_SIZES.sm, color: COLORS.gray900 },
  taskHeader: { flexDirection: 'row', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  taskHeaderText: { fontSize: FONT_SIZES.xs, color: COLORS.gray500, fontWeight: '600' },
  dashedBorder: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.gray300, marginHorizontal: SPACING.md },
  taskList: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  taskRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  taskName: { fontSize: FONT_SIZES.sm, color: COLORS.gray800 },
  taskProject: { fontSize: FONT_SIZES.xs, color: COLORS.gray600 },
  taskDuration: { fontSize: FONT_SIZES.sm, color: COLORS.gray900 },
  emptyTasks: { paddingVertical: SPACING.base, alignItems: 'center' },
  emptyText: { fontSize: FONT_SIZES.sm, color: COLORS.gray400 },
  totalValue: { fontSize: FONT_SIZES.sm, fontWeight: 'bold', color: COLORS.gray900 },
  detailsSection: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.sm },
  detailsTitle: { fontSize: FONT_SIZES.xs, color: COLORS.gray500, fontWeight: '600', marginBottom: SPACING.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  grandTotal: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md },
  grandTotalLabel: { fontSize: FONT_SIZES.base, fontWeight: 'bold', color: COLORS.gray900 },
  grandTotalValue: { fontSize: FONT_SIZES['2xl'], fontWeight: 'bold', color: COLORS.gray900 },
  barcodeSection: { paddingVertical: SPACING.base, alignItems: 'center' },
  barcodeTitle: { fontSize: FONT_SIZES.xs, color: COLORS.gray500, marginBottom: SPACING.sm },
  barcodeLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '80%', marginTop: SPACING.xs },
  barcodeLabel: { fontSize: FONT_SIZES.xs, color: COLORS.gray400 },
  footer: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.base },
  footerText: { fontSize: FONT_SIZES.sm, color: COLORS.gray600 },
  footerSubtext: { fontSize: FONT_SIZES.xs, color: COLORS.gray400, marginTop: 4 },
  footerGradient: { height: 16, backgroundColor: COLORS.gray100, borderBottomLeftRadius: BORDER_RADIUS.lg, borderBottomRightRadius: BORDER_RADIUS.lg },
  downloadButton: { position: 'absolute', top: SPACING.base, right: SPACING.base, width: 36, height: 36, backgroundColor: COLORS.gray900, borderRadius: 18, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
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
  const [weeklyData, setWeeklyData] = useState<DailyArchive[]>([]);
  const [currentIndex, setCurrentIndex] = useState(6);
  const [showMonthly, setShowMonthly] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const nickname = '사용자';
  
  useEffect(() => { setWeeklyData(generateWeeklyData()); }, []);
  
  const totalWeekTime = weeklyData.reduce((sum, d) => sum + d.totalTimeMs, 0);
  
  const onRefresh = async () => { setRefreshing(true); await new Promise(r => setTimeout(r, 1000)); setWeeklyData(generateWeeklyData()); setRefreshing(false); };
  
  const scrollToIndex = (index: number) => { flatListRef.current?.scrollToIndex({ index, animated: true }); setCurrentIndex(index); };
  
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
    if (idx !== currentIndex && idx >= 0 && idx < weeklyData.length) setCurrentIndex(idx);
  };
  
  if (showMonthly) return <SafeAreaView style={styles.container} edges={['top']}><MonthlyArchivePage onBack={() => setShowMonthly(false)} onSelectDate={() => setShowMonthly(false)} /></SafeAreaView>;
  
  if (weeklyData.length === 0) return <SafeAreaView style={styles.container} edges={['top']}><View style={styles.loading}><Text style={styles.loadingText}>로딩 중...</Text></View></SafeAreaView>;
  
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
              {day.totalTimeMs > 0 && currentIndex !== index && <View style={styles.dateNavDot} />}
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
          renderItem={({ item, index }) => <ReceiptCard archive={item} nickname={nickname} onDownload={() => console.log(`Download ${index}`)} />}
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
          <TouchableOpacity style={styles.primaryButton} onPress={() => console.log('Download')}>
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
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
});

export default StudyScreen;
