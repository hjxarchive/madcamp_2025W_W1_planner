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
  ActivityIndicator,
  Alert,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@constants/index';
import { api } from '@services/api';

// 선택 가능한 이모지 목록
const AVATAR_EMOJIS = [
  '👤', '😀', '😎', '🤓', '🧐', '🤔', '😊', '🥳',
  '🦊', '🐱', '🐶', '🐼', '🐨', '🦁', '🐯', '🐻',
  '🌟', '⭐', '🔥', '💎', '🎯', '🚀', '💡', '🎨',
  '📚', '💻', '🎮', '🎵', '☕', '🍀', '🌈', '🌙',
];

interface NicknameSetupModalProps {
  isOpen: boolean;
  onComplete: (nickname: string, emoji: string) => void;
}

export const NicknameSetupModal: React.FC<NicknameSetupModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [nickname, setNickname] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('😀');
  const [isSaving, setIsSaving] = useState(false);
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [isCheckingNickname, setIsCheckingNickname] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(false);
  const checkNicknameTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 닉네임 중복 확인 (debounced)
  const checkNicknameAvailability = useCallback(async (name: string) => {
    if (!name.trim()) {
      setNicknameError(null);
      setIsNicknameAvailable(false);
      setIsCheckingNickname(false);
      return;
    }

    setIsCheckingNickname(true);
    try {
      const result = await api.checkNickname(name.trim());
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
  }, []);

  // 닉네임 변경 시 debounced 중복 확인
  const handleNicknameChange = useCallback((text: string) => {
    setNickname(text);
    setNicknameError(null);
    setIsNicknameAvailable(false);

    // 기존 타이머 취소
    if (checkNicknameTimeoutRef.current) {
      clearTimeout(checkNicknameTimeoutRef.current);
    }

    // 500ms 후 닉네임 확인
    if (text.trim()) {
      checkNicknameTimeoutRef.current = setTimeout(() => {
        checkNicknameAvailability(text);
      }, 500);
    }
  }, [checkNicknameAvailability]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (checkNicknameTimeoutRef.current) {
        clearTimeout(checkNicknameTimeoutRef.current);
      }
    };
  }, []);

  // 저장 버튼 비활성화 조건
  const isSaveDisabled = !nickname.trim() || isSaving || isCheckingNickname || !isNicknameAvailable;

  const handleSave = async () => {
    if (!nickname.trim() || !isNicknameAvailable) return;

    setIsSaving(true);
    setNicknameError(null);

    try {
      // 저장 전 한번 더 닉네임 중복 확인
      const checkResult = await api.checkNickname(nickname.trim());
      if (checkResult.data && !checkResult.data.available) {
        setNicknameError(checkResult.data.message);
        setIsNicknameAvailable(false);
        Alert.alert('닉네임 중복', '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
        setIsSaving(false);
        return;
      }

      await api.updateMe({
        nickname: nickname.trim(),
        profileEmoji: selectedEmoji,
      });

      onComplete(nickname.trim(), selectedEmoji);
    } catch (error: any) {
      console.error('닉네임 설정 실패:', error);

      // 409 에러 (닉네임 중복) 처리
      if (error?.response?.status === 409 || error?.message?.includes('409')) {
        setNicknameError('이미 사용 중인 닉네임입니다.');
        Alert.alert('닉네임 중복', '이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      } else {
        Alert.alert('오류', '닉네임 설정에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => {}} // 닫기 불가
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>프로필 설정</Text>
            <Text style={styles.headerSubtitle}>Momento에 오신 것을 환영합니다!</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Avatar Selection */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarEmoji}>{selectedEmoji}</Text>
              </View>
              <Text style={styles.avatarHint}>프로필 이모지를 선택하세요</Text>
            </View>

            {/* Emoji Grid */}
            <View style={styles.emojiGrid}>
              {AVATAR_EMOJIS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    selectedEmoji === emoji && styles.emojiOptionSelected,
                  ]}
                  onPress={() => setSelectedEmoji(emoji)}
                >
                  <Text style={styles.emojiOptionText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nickname Input */}
            <View style={styles.nicknameSection}>
              <Text style={styles.nicknameLabel}>닉네임</Text>
              <View style={styles.nicknameInputContainer}>
                <TextInput
                  style={[
                    styles.nicknameInput,
                    nicknameError ? styles.nicknameInputError : null,
                    isNicknameAvailable && nickname.trim() ? styles.nicknameInputSuccess : null,
                  ]}
                  value={nickname}
                  onChangeText={handleNicknameChange}
                  placeholder="사용할 닉네임을 입력하세요"
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
              {!nicknameError && isNicknameAvailable && nickname.trim() && (
                <Text style={styles.successText}>사용 가능한 닉네임입니다</Text>
              )}
            </View>

            {/* Save Button */}
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
                <>
                  <Icon name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>시작하기</Text>
                </>
              )}
            </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS['2xl'],
    padding: SPACING.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.gray900,
    marginBottom: SPACING.xs,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray500,
  },
  content: {
    alignItems: 'center',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatarEmoji: {
    fontSize: 56,
  },
  avatarHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray500,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  emojiOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiOptionSelected: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emojiOptionText: {
    fontSize: 20,
  },
  nicknameSection: {
    width: '100%',
    marginBottom: SPACING.xl,
  },
  nicknameLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  nicknameInputContainer: {
    position: 'relative',
  },
  nicknameInput: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.gray300,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.gray50,
  },
  nicknameInputError: {
    borderColor: COLORS.error,
  },
  nicknameInputSuccess: {
    borderColor: COLORS.success,
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
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.gray900,
    borderRadius: BORDER_RADIUS.xl,
    gap: SPACING.sm,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.gray300,
  },
  saveButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: FONT_WEIGHTS.semibold,
    color: '#FFFFFF',
  },
});

export default NicknameSetupModal;
