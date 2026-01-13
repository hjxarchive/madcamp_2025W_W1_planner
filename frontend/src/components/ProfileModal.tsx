import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@constants/index';
import { api } from '@services/api';
import type { User } from '../types';

// 선택 가능한 이모지 목록
const AVATAR_EMOJIS = [
  '👤', '😀', '😎', '🤓', '🧐', '🤔', '😊', '🥳',
  '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐻',
  '🌟', '⭐', '🔥', '💎', '🎯', '🚀', '💡', '🎨',
  '📚', '💻', '🎮', '🎵', '☕', '🍀', '🌈', '🌙',
];

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser?: (user: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNickname, setEditedNickname] = useState(user?.nickname || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState(user?.emoji || '👤');
  const [isSaving, setIsSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(true);
  const checkNicknameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      setEditedNickname(user.nickname || '');
      setSelectedEmoji(user.emoji || '👤');
    }
  }, [user]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
      setShowEmojiPicker(false);
      setNicknameError(null);
      setIsNicknameAvailable(true);
    }
  }, [isOpen]);

  // 닉네임 중복 확인 (debounced)
  const checkNicknameAvailability = useCallback(async (nickname: string) => {
    if (!nickname.trim() || nickname.trim() === user?.nickname) {
      setNicknameError(null);
      setIsNicknameAvailable(true);
      setIsCheckingNickname(false);
      return;
    }

    setIsCheckingNickname(true);
    try {
      const result = await api.checkNickname(nickname.trim());
      if (result.data) {
        setIsNicknameAvailable(result.data.available);
        if (!result.data.available) {
          setNicknameError(result.data.message);
        } else {
          setNicknameError(null);
        }
      }
    } catch (error) {
      console.error('닉네임 확인 실패:', error);
    } finally {
      setIsCheckingNickname(false);
    }
  }, [user?.nickname]);

  // 닉네임 변경 시 debounced 중복 확인
  const handleNicknameChange = useCallback((text: string) => {
    setEditedNickname(text);
    setNicknameError(null);

    // 기존 타이머 취소
    if (checkNicknameTimeoutRef.current) {
      clearTimeout(checkNicknameTimeoutRef.current);
    }

    // 500ms 후 닉네임 확인
    checkNicknameTimeoutRef.current = setTimeout(() => {
      checkNicknameAvailability(text);
    }, 500);
  }, [checkNicknameAvailability]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (checkNicknameTimeoutRef.current) {
        clearTimeout(checkNicknameTimeoutRef.current);
      }
    };
  }, []);

  if (!user) return null;

  // 저장 버튼 비활성화 조건
  const isSaveDisabled = !editedNickname.trim() || isSaving || isCheckingNickname || !isNicknameAvailable;

  const handleSave = async () => {
    if (!editedNickname.trim()) return;

    setIsSaving(true);
    setNicknameError(null);

    try {
      await api.updateMe({
        nickname: editedNickname.trim(),
        profileEmoji: selectedEmoji,
      });

      // 성공 시 UI 업데이트
      if (onUpdateUser) {
        onUpdateUser({ ...user, nickname: editedNickname.trim(), emoji: selectedEmoji });
      }
      setIsEditing(false);
    } catch (error: any) {
      console.error('사용자 정보 업데이트 실패:', error);

      // 409 에러 (닉네임 중복) 처리
      if (error?.response?.status === 409 || error?.message?.includes('409')) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        Alert.alert('닉네임 중복', '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      } else {
        Alert.alert('오류', '정보 업데이트에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    setSelectedEmoji(emoji);
    setShowEmojiPicker(false);

    // 이모지만 변경하는 경우 바로 저장
    if (!isEditing) {
      setIsSaving(true);
      try {
        await api.updateMe({
          nickname: user.nickname,
          profileEmoji: emoji,
        });
        if (onUpdateUser) {
          onUpdateUser({ ...user, emoji });
        }
      } catch (error) {
        console.error('이모지 업데이트 실패:', error);
        setSelectedEmoji(user.emoji || '👤'); // 롤백
        Alert.alert('오류', '이모지 업데이트에 실패했습니다.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleCancel = () => {
    setEditedNickname(user.nickname || '');
    setSelectedEmoji(user.emoji || '👤');
    setIsEditing(false);
    setNicknameError(null);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>개인정보</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="close" size={24} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar Circle with Emoji */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isSaving}
            >
              <Text style={styles.avatarEmoji}>
                {selectedEmoji}
              </Text>
              <View style={styles.editBadge}>
                <Icon name="pencil" size={14} color={COLORS.surface} />
              </View>
              {isSaving && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
              )}
            </TouchableOpacity>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <View style={styles.emojiPickerContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.emojiScrollContent}
                >
                  {AVATAR_EMOJIS.map((emoji) => (
                    <TouchableOpacity
                      key={emoji}
                      style={[
                        styles.emojiOption,
                        selectedEmoji === emoji && styles.emojiOptionSelected,
                      ]}
                      onPress={() => handleEmojiSelect(emoji)}
                    >
                      <Text style={styles.emojiOptionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Nickname Section */}
            <View style={styles.nicknameSection}>
              {isEditing ? (
                <>
                  <View style={styles.nicknameInputContainer}>
                    <TextInput
                      style={[
                        styles.nicknameInput,
                        nicknameError ? styles.nicknameInputError : null,
                      ]}
                      value={editedNickname}
                      onChangeText={handleNicknameChange}
                      autoFocus
                      placeholder="닉네임을 입력하세요"
                      placeholderTextColor={COLORS.gray400}
                      maxLength={20}
                      editable={!isSaving}
                    />
                    {isCheckingNickname && (
                      <ActivityIndicator
                        size="small"
                        color={COLORS.primary}
                        style={styles.checkingIndicator}
                      />
                    )}
                  </View>
                  {nicknameError && (
                    <Text style={styles.errorText}>{nicknameError}</Text>
                  )}
                  {!nicknameError && isNicknameAvailable && editedNickname.trim() && editedNickname.trim() !== user.nickname && (
                    <Text style={styles.successText}>사용 가능한 닉네임입니다</Text>
                  )}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        isSaveDisabled && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={isSaveDisabled}
                    >
                      {isSaving ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text style={styles.saveButtonText}>저장</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
                      disabled={isSaving}
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.nickname}>{user.nickname}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                    disabled={isSaving}
                  >
                    <Text style={styles.editButtonText}>수정</Text>
                  </TouchableOpacity>
                </>
              )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: Math.min(SCREEN_WIDTH - 32, 500),
    minHeight: 500,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING['2xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.gray900,
  },
  closeButton: {
    padding: SPACING.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['2xl'],
  },
  avatarContainer: {
    width: 192,
    height: 192,
    borderRadius: 96,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 96,
  },
  editBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray600,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiPickerContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  emojiScrollContent: {
    paddingHorizontal: SPACING.sm,
    gap: SPACING.xs,
  },
  emojiOption: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
  },
  emojiOptionSelected: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emojiOptionText: {
    fontSize: 28,
  },
  nicknameSection: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: SPACING.base,
  },
  nickname: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '600',
    color: COLORS.gray900,
    marginBottom: SPACING.md,
  },
  nicknameInputContainer: {
    width: '100%',
    position: 'relative',
  },
  nicknameInput: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: '600',
    color: COLORS.gray900,
    textAlign: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    marginBottom: SPACING.sm,
  },
  nicknameInputError: {
    borderColor: COLORS.error,
  },
  checkingIndicator: {
    position: 'absolute',
    right: SPACING.md,
    top: '50%',
    marginTop: -10,
  },
  successText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  saveButton: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.lg,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  cancelButton: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.lg,
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  editButton: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
  },
  editButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
  },
});

export default ProfileModal;
