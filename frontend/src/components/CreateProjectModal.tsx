import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Alert,
  Dimensions,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@constants/index';
import { api } from '@services/api';
import type { User } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: () => void;
  currentUser: User | null;
}

// 간단한 달력 컴포넌트
const SimpleCalendar: React.FC<{
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
}> = ({ selectedDate, onSelectDate, onClose }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${month}-${dayStr}`;
    onSelectDate(dateStr);
    onClose();
  };

  const isSelectedDay = (day: number) => {
    if (!selectedDate) return false;
    const month = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return selectedDate === `${currentYear}-${month}-${dayStr}`;
  };

  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentMonth &&
      today.getFullYear() === currentYear
    );
  };

  const isPastDay = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return checkDate < todayDate;
  };

  // 달력 그리드 생성
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <View style={calendarStyles.container}>
      <View style={calendarStyles.header}>
        <TouchableOpacity onPress={goToPrevMonth} style={calendarStyles.navButton}>
          <Icon name="chevron-left" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
        <Text style={calendarStyles.headerText}>
          {currentYear}년 {currentMonth + 1}월
        </Text>
        <TouchableOpacity onPress={goToNextMonth} style={calendarStyles.navButton}>
          <Icon name="chevron-right" size={24} color={COLORS.gray600} />
        </TouchableOpacity>
      </View>

      <View style={calendarStyles.dayNamesRow}>
        {dayNames.map((name, index) => (
          <Text
            key={name}
            style={[
              calendarStyles.dayName,
              index === 0 && { color: '#EF4444' },
              index === 6 && { color: '#3B82F6' },
            ]}
          >
            {name}
          </Text>
        ))}
      </View>

      <View style={calendarStyles.daysGrid}>
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={calendarStyles.dayCell} />;
          }

          const selected = isSelectedDay(day);
          const todayDay = isToday(day);
          const past = isPastDay(day);
          const isSunday = index % 7 === 0;
          const isSaturday = index % 7 === 6;

          return (
            <TouchableOpacity
              key={day}
              style={[
                calendarStyles.dayCell,
                selected && calendarStyles.dayCellSelected,
                todayDay && !selected && calendarStyles.dayCellToday,
              ]}
              onPress={() => handleSelectDay(day)}
              disabled={past}
            >
              <Text
                style={[
                  calendarStyles.dayText,
                  selected && calendarStyles.dayTextSelected,
                  todayDay && !selected && calendarStyles.dayTextToday,
                  past && calendarStyles.dayTextPast,
                  isSunday && !selected && !past && { color: '#EF4444' },
                  isSaturday && !selected && !past && { color: '#3B82F6' },
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={calendarStyles.buttonRow}>
        <TouchableOpacity
          style={calendarStyles.clearButton}
          onPress={() => {
            onSelectDate('');
            onClose();
          }}
        >
          <Text style={calendarStyles.clearButtonText}>날짜 해제</Text>
        </TouchableOpacity>
        <TouchableOpacity style={calendarStyles.closeButton} onPress={onClose}>
          <Text style={calendarStyles.closeButtonText}>닫기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const calendarStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  navButton: {
    padding: SPACING.xs,
  },
  headerText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    color: COLORS.gray500,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.full,
  },
  dayCellToday: {
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.full,
  },
  dayText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray800,
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  dayTextToday: {
    fontWeight: '600',
    color: COLORS.gray900,
  },
  dayTextPast: {
    color: COLORS.gray300,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  clearButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  clearButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  closeButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
  },
  closeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
    fontWeight: '500',
  },
});

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  currentUser,
}) => {
  const [title, setTitle] = useState('');
  const [isTeam, setIsTeam] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [memberNicknames, setMemberNicknames] = useState<string[]>([]);
  const [newMemberNickname, setNewMemberNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleAddMember = async () => {
    const nickname = newMemberNickname.trim();
    if (!nickname) return;
    if (nickname === currentUser?.nickname) {
      Alert.alert('알림', '본인은 자동으로 추가됩니다.');
      return;
    }
    if (memberNicknames.includes(nickname)) {
      Alert.alert('알림', '이미 추가된 멤버입니다.');
      return;
    }

    // 사용자 존재 여부 검증
    setIsSearching(true);
    try {
      const res = await api.searchUserByNickname(nickname);
      if (res.error || !res.data) {
        Alert.alert('알림', `'${nickname}' 사용자를 찾을 수 없습니다.\n닉네임을 다시 확인해주세요.`);
        return;
      }
      // 사용자가 존재하면 추가
      setMemberNicknames([...memberNicknames, nickname]);
      setNewMemberNickname('');
    } catch (error) {
      console.error('사용자 검색 실패:', error);
      Alert.alert('오류', '사용자 검색에 실패했습니다.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveMember = (nickname: string) => {
    setMemberNicknames(memberNicknames.filter(n => n !== nickname));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('알림', '프로젝트명을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    try {
      const projectData: {
        title: string;
        plannedEndDate?: string;
        memberNicknames?: string[];
      } = {
        title: title.trim(),
      };

      if (dueDate) {
        projectData.plannedEndDate = dueDate;
      }

      if (isTeam && memberNicknames.length > 0) {
        projectData.memberNicknames = memberNicknames;
      }

      const res = await api.createProject(projectData);
      
      if (res.error) {
        // 서버 에러 메시지 파싱
        let errorMsg = res.error;
        if (errorMsg.includes('사용자를 찾을 수 없습니다')) {
          errorMsg = '초대하려는 사용자를 찾을 수 없습니다.\n닉네임을 다시 확인해주세요.';
        }
        Alert.alert('오류', errorMsg);
        return;
      }

      // 성공
      resetForm();
      onClose();
      onProjectCreated();
    } catch (error) {
      console.error('프로젝트 생성 실패:', error);
      Alert.alert('오류', '프로젝트 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDueDate('');
    setIsTeam(false);
    setShowCalendar(false);
    setMemberNicknames([]);
    setNewMemberNickname('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>새 프로젝트</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* 프로젝트명 */}
              <View style={styles.field}>
                <Text style={styles.label}>프로젝트명 *</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="예: 해석학 공부"
                  placeholderTextColor={COLORS.gray400}
                  autoFocus
                />
              </View>

              {/* 마감일 */}
              <View style={styles.field}>
                <Text style={styles.label}>마감일 (선택)</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => setShowCalendar(!showCalendar)}
                >
                  <Icon name="calendar" size={20} color={COLORS.gray500} />
                  <Text style={[styles.dateButtonText, !dueDate && styles.dateButtonPlaceholder]}>
                    {dueDate ? formatDisplayDate(dueDate) : '날짜를 선택하세요'}
                  </Text>
                  <Icon
                    name={showCalendar ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.gray400}
                  />
                </TouchableOpacity>

                {showCalendar && (
                  <SimpleCalendar
                    selectedDate={dueDate}
                    onSelectDate={setDueDate}
                    onClose={() => setShowCalendar(false)}
                  />
                )}
              </View>

              {/* 팀 프로젝트 토글 */}
              <View style={styles.toggleField}>
                <Text style={styles.label}>팀 프로젝트</Text>
                <Switch
                  value={isTeam}
                  onValueChange={setIsTeam}
                  trackColor={{ false: COLORS.gray300, true: COLORS.gray600 }}
                  thumbColor={isTeam ? COLORS.gray900 : COLORS.gray100}
                />
              </View>

              {/* 팀 멤버 추가 */}
              {isTeam && (
                <View style={styles.field}>
                  <Text style={styles.label}>참여 인원</Text>
                  <Text style={styles.hint}>
                    * 등록된 사용자의 닉네임만 초대할 수 있습니다
                  </Text>
                  
                  {/* 현재 사용자 (나) */}
                  <View style={styles.memberItem}>
                    <View style={styles.memberInfo}>
                      <Icon name="account" size={18} color={COLORS.gray600} />
                      <Text style={styles.memberName}>{currentUser?.nickname || '나'}</Text>
                      <Text style={styles.memberMe}>(나)</Text>
                    </View>
                  </View>

                  {/* 추가된 멤버 목록 */}
                  {memberNicknames.map((nickname) => (
                    <View key={nickname} style={styles.memberItem}>
                      <View style={styles.memberInfo}>
                        <Icon name="account" size={18} color={COLORS.gray600} />
                        <Text style={styles.memberName}>{nickname}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveMember(nickname)}
                        style={styles.removeMemberButton}
                      >
                        <Icon name="close" size={18} color={COLORS.gray400} />
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* 새 멤버 추가 입력 */}
                  <View style={styles.addMemberRow}>
                    <TextInput
                      style={[styles.input, styles.addMemberInput]}
                      value={newMemberNickname}
                      onChangeText={setNewMemberNickname}
                      placeholder="닉네임으로 초대"
                      placeholderTextColor={COLORS.gray400}
                      onSubmitEditing={handleAddMember}
                      editable={!isSearching}
                    />
                    <TouchableOpacity
                      style={[styles.addMemberButton, isSearching && styles.addMemberButtonDisabled]}
                      onPress={handleAddMember}
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <Text style={styles.searchingText}>...</Text>
                      ) : (
                        <Icon name="plus" size={20} color={COLORS.gray700} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* 버튼 */}
            <View style={styles.buttons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? '생성 중...' : '프로젝트 생성'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.base,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    width: Math.min(SCREEN_WIDTH - 32, 500),
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.gray900,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
  },
  field: {
    marginBottom: SPACING.base,
  },
  toggleField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.base,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
  },
  hint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    backgroundColor: COLORS.surface,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  dateButtonText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
  },
  dateButtonPlaceholder: {
    color: COLORS.gray400,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  memberName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray800,
  },
  memberMe: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  removeMemberButton: {
    padding: SPACING.xs,
  },
  addMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  addMemberInput: {
    flex: 1,
  },
  addMemberButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMemberButtonDisabled: {
    opacity: 0.5,
  },
  searchingText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray500,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    gap: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  submitButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray900,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray400,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CreateProjectModal;
