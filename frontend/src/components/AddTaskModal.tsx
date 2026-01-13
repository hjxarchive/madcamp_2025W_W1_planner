import React, { useState, useEffect } from 'react';
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
  Dimensions,
  Alert,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@constants/index';
import type { Member } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: { content: string; assigneeId?: string; assigneeName?: string }) => void;
  members?: Member[];
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  members,
}) => {
  const [content, setContent] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);
  const [showMemberSelect, setShowMemberSelect] = useState(false);

  // 개인 프로젝트 여부 (멤버가 1명인 경우)
  const isPersonalProject = members && members.length === 1;
  // 팀 프로젝트 여부 (멤버가 2명 이상인 경우)
  const isTeamProject = members && members.length > 1;

  // 개인 프로젝트의 경우 모달이 열릴 때 자동으로 담당자 지정
  useEffect(() => {
    if (isOpen && isPersonalProject && members) {
      setAssigneeId(members[0].id);
    }
  }, [isOpen, isPersonalProject, members]);

  const handleSubmit = () => {
    if (!content.trim()) return;

    // 팀 프로젝트의 경우 담당자 필수 확인
    if (isTeamProject && !assigneeId) {
      Alert.alert('알림', '담당자를 선택해주세요.');
      return;
    }

    const assignee = members?.find(m => m.id === assigneeId);

    onAdd({
      content: content.trim(),
      assigneeId: assignee?.id,
      assigneeName: assignee?.nickname,
    });

    // 초기화
    setContent('');
    setAssigneeId(undefined);
    onClose();
  };

  const handleClose = () => {
    setContent('');
    setAssigneeId(undefined);
    setShowMemberSelect(false);
    onClose();
  };

  const selectedMember = members?.find(m => m.id === assigneeId);

  // 버튼 비활성화 조건: content가 없거나, 팀 프로젝트인데 담당자가 없는 경우
  const isSubmitDisabled = !content.trim() || (isTeamProject && !assigneeId);

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
              <Text style={styles.headerTitle}>새 Task</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={COLORS.gray400} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Task 내용 */}
              <View style={styles.field}>
                <Text style={styles.label}>Task 내용 *</Text>
                <TextInput
                  style={styles.input}
                  value={content}
                  onChangeText={setContent}
                  placeholder="예: 수업 복습하기"
                  placeholderTextColor={COLORS.gray400}
                  autoFocus
                  multiline
                  numberOfLines={2}
                />
              </View>

              {/* 담당자 선택 (팀 프로젝트인 경우만 표시) */}
              {isTeamProject && members && (
                <View style={styles.field}>
                  <Text style={styles.label}>담당자 *</Text>

                  {/* 현재 선택된 담당자 표시 또는 선택 버튼 */}
                  <TouchableOpacity
                    style={styles.memberSelectButton}
                    onPress={() => setShowMemberSelect(!showMemberSelect)}
                  >
                    {selectedMember ? (
                      <View style={styles.selectedMemberRow}>
                        <Icon name="account" size={18} color={COLORS.gray600} />
                        <Text style={styles.selectedMemberText}>{selectedMember.nickname}</Text>
                      </View>
                    ) : (
                      <Text style={styles.placeholderText}>담당자를 선택하세요</Text>
                    )}
                    <Icon
                      name={showMemberSelect ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={COLORS.gray400}
                    />
                  </TouchableOpacity>

                  {/* 멤버 목록 */}
                  {showMemberSelect && (
                    <View style={styles.memberList}>
                      {/* 멤버 목록 (담당자 없음 옵션 제거) */}
                      {members.map(member => (
                        <TouchableOpacity
                          key={member.id}
                          style={[
                            styles.memberOption,
                            assigneeId === member.id && styles.memberOptionSelected,
                          ]}
                          onPress={() => {
                            setAssigneeId(member.id);
                            setShowMemberSelect(false);
                          }}
                        >
                          <View style={styles.memberOptionRow}>
                            <Icon name="account" size={18} color={COLORS.gray600} />
                            <Text style={[
                              styles.memberOptionText,
                              assigneeId === member.id && styles.memberOptionTextSelected,
                            ]}>
                              {member.nickname}
                            </Text>
                          </View>
                          {assigneeId === member.id && (
                            <Icon name="check" size={18} color={COLORS.gray900} />
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* 버튼 */}
            <View style={styles.buttons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isSubmitDisabled && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitDisabled}
              >
                <Text style={styles.submitButtonText}>추가</Text>
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
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.gray700,
    marginBottom: SPACING.xs,
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
    minHeight: 50,
    textAlignVertical: 'top',
  },
  memberSelectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  selectedMemberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  selectedMemberText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
  },
  placeholderText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray400,
  },
  memberList: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  memberOptionSelected: {
    backgroundColor: COLORS.gray200,
  },
  memberOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  memberOptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray700,
  },
  memberOptionTextSelected: {
    fontWeight: '600',
    color: COLORS.gray900,
  },
  buttons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.base,
    gap: SPACING.md,
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
    color: COLORS.gray600,
  },
  submitButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray900,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  submitButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: '#fff',
  },
});

export default AddTaskModal;
