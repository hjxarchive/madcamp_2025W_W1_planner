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
  Pressable,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { COLORS, FONT_SIZES, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from '@constants/index';
import type { User } from '../types';

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

  useEffect(() => {
    if (user) {
      setEditedNickname(user.nickname || '');
    }
  }, [user]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  if (!user) return null;

  const handleSave = () => {
    if (editedNickname.trim() && onUpdateUser) {
      onUpdateUser({ ...user, nickname: editedNickname.trim() });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedNickname(user.nickname || '');
    setIsEditing(false);
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
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>
                {user.emoji || '👤'}
              </Text>
            </View>

            {/* Nickname Section */}
            <View style={styles.nicknameSection}>
              {isEditing ? (
                <>
                  <TextInput
                    style={styles.nicknameInput}
                    value={editedNickname}
                    onChangeText={setEditedNickname}
                    autoFocus
                    placeholder="닉네임을 입력하세요"
                    placeholderTextColor={COLORS.gray400}
                    maxLength={20}
                  />
                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.saveButton,
                        !editedNickname.trim() && styles.saveButtonDisabled,
                      ]}
                      onPress={handleSave}
                      disabled={!editedNickname.trim()}
                    >
                      <Text style={styles.saveButtonText}>저장</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={handleCancel}
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
    width: '90%',
    maxWidth: 360,
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
    marginBottom: SPACING['2xl'],
  },
  avatarEmoji: {
    fontSize: 96,
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
    marginBottom: SPACING.md,
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
