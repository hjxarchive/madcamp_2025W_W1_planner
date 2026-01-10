import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { api } from '@services/api';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@constants/index';

interface CollabMember {
  id: string;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  isOnline: boolean;
}

interface CollabProject {
  id: string;
  title: string;
  description?: string;
  color: string;
  members: CollabMember[];
  taskCount: number;
  completedCount: number;
  lastActivity?: string;
}

export const CollabScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [projects, setProjects] = useState<CollabProject[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const res = await api.getCollabProjects();
      if (res.data) {
        setProjects(res.data);
      }
    } catch (error) {
      console.error('Failed to load collab projects:', error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCreateProject = () => {
    // Navigate to create project modal
  };

  const handleProjectPress = (projectId: string) => {
    // Navigate to project detail
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>협업 프로젝트</Text>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateProject}>
            <Icon name="plus" size={20} color="#fff" />
            <Text style={styles.createButtonText}>새 프로젝트</Text>
          </TouchableOpacity>
        </View>

        {/* Invitations */}
        {invitations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>초대</Text>
            {invitations.map((invitation) => (
              <View key={invitation.id} style={styles.invitationCard}>
                <View style={styles.invitationInfo}>
                  <Text style={styles.invitationTitle}>{invitation.projectTitle}</Text>
                  <Text style={styles.invitationFrom}>
                    {invitation.inviterName}님이 초대했습니다
                  </Text>
                </View>
                <View style={styles.invitationActions}>
                  <TouchableOpacity style={styles.acceptButton}>
                    <Icon name="check" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.declineButton}>
                    <Icon name="close" size={20} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>내 프로젝트</Text>
          
          {projects.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="account-group-outline" size={64} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>협업 프로젝트가 없습니다</Text>
              <Text style={styles.emptyText}>
                팀원들과 함께 프로젝트를 진행해보세요
              </Text>
              <TouchableOpacity style={styles.createProjectButton} onPress={handleCreateProject}>
                <Icon name="plus" size={20} color="#fff" />
                <Text style={styles.createProjectButtonText}>프로젝트 만들기</Text>
              </TouchableOpacity>
            </View>
          ) : (
            projects.map((project) => (
              <TouchableOpacity
                key={project.id}
                style={styles.projectCard}
                onPress={() => handleProjectPress(project.id)}
                activeOpacity={0.7}
              >
                {/* Project header */}
                <View style={styles.projectHeader}>
                  <View style={[styles.projectColor, { backgroundColor: project.color }]} />
                  <View style={styles.projectInfo}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    {project.description && (
                      <Text style={styles.projectDescription} numberOfLines={1}>
                        {project.description}
                      </Text>
                    )}
                  </View>
                  <Icon name="chevron-right" size={24} color={COLORS.textMuted} />
                </View>

                {/* Members */}
                <View style={styles.membersRow}>
                  <View style={styles.memberAvatars}>
                    {project.members.slice(0, 5).map((member, index) => (
                      <View
                        key={member.id}
                        style={[
                          styles.memberAvatar,
                          { marginLeft: index > 0 ? -8 : 0 },
                          member.isOnline && styles.memberOnline,
                        ]}
                      >
                        {member.avatar ? (
                          <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
                        ) : (
                          <View style={[styles.avatarPlaceholder, { backgroundColor: project.color }]}>
                            <Text style={styles.avatarText}>{member.name.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    {project.members.length > 5 && (
                      <View style={[styles.memberAvatar, styles.memberMore]}>
                        <Text style={styles.memberMoreText}>+{project.members.length - 5}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.onlineIndicator}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>
                      {project.members.filter((m) => m.isOnline).length}명 온라인
                    </Text>
                  </View>
                </View>

                {/* Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${project.taskCount > 0 ? (project.completedCount / project.taskCount) * 100 : 0}%`,
                          backgroundColor: project.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {project.completedCount}/{project.taskCount} 완료
                  </Text>
                </View>

                {/* Last activity */}
                {project.lastActivity && (
                  <View style={styles.lastActivity}>
                    <Icon name="clock-outline" size={14} color={COLORS.textMuted} />
                    <Text style={styles.lastActivityText}>{project.lastActivity}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Quick invite */}
        <View style={styles.inviteSection}>
          <View style={styles.inviteSectionHeader}>
            <Icon name="account-plus" size={24} color={COLORS.primary} />
            <Text style={styles.inviteSectionTitle}>팀원 초대하기</Text>
          </View>
          <Text style={styles.inviteSectionText}>
            이메일 또는 링크를 통해 팀원을 초대할 수 있습니다
          </Text>
          <View style={styles.inviteButtons}>
            <TouchableOpacity style={styles.inviteButton}>
              <Icon name="email-outline" size={20} color={COLORS.primary} />
              <Text style={styles.inviteButtonText}>이메일로 초대</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inviteButton}>
              <Icon name="link-variant" size={20} color={COLORS.primary} />
              <Text style={styles.inviteButtonText}>링크 복사</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.base,
  },
  headerTitle: {
    fontSize: FONT_SIZES['2xl'],
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  createButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#fff',
    marginLeft: SPACING.xs,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  invitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  invitationInfo: {
    flex: 1,
  },
  invitationTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  invitationFrom: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  invitationActions: {
    flexDirection: 'row',
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  declineButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.base,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.base,
  },
  createProjectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  createProjectButtonText: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: '#fff',
    marginLeft: SPACING.sm,
  },
  projectCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.md,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  projectColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: SPACING.md,
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  projectDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  membersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  memberAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.surface,
    overflow: 'hidden',
  },
  memberOnline: {
    borderColor: COLORS.success,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: 'bold',
    color: '#fff',
  },
  memberMore: {
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  memberMoreText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
    marginRight: SPACING.xs,
  },
  onlineText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 2,
    marginRight: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  lastActivity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastActivityText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginLeft: SPACING.xs,
  },
  inviteSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    marginBottom: SPACING.xl,
  },
  inviteSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  inviteSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: SPACING.sm,
  },
  inviteSectionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  inviteButtons: {
    flexDirection: 'row',
  },
  inviteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    marginRight: SPACING.sm,
  },
  inviteButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
});

export default CollabScreen;
