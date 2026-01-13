import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, FONTS } from '@constants/index';
import { studySocketService, ParticipantInfo } from '@services/studySocket';
import api, { User } from '@services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Location {
  id: string;
  name: string;
}

const CoStudyScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Load user and locations on mount
  useEffect(() => {
    loadUserAndLocations();
  }, []);

  const loadUserAndLocations = async () => {
    try {
      const [userRes, locRes] = await Promise.all([
        api.getMe(),
        api.getLocations(),
      ]);
      if (userRes.data) {
        setUser(userRes.data);
      }
      if (locRes.data?.data) {
        setLocations(locRes.data.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to study socket when user is available
  useEffect(() => {
    if (!user) return;

    const connectSocket = async () => {
      try {
        // In dev mode, use 'dev-token'
        const token = __DEV__ ? 'dev-token' : 'dev-token'; // TODO: Get actual token from Firebase
        await studySocketService.connect(token);
        setIsConnected(true);
        studySocketService.syncStudy();
      } catch (error) {
        console.error('Study socket connection failed:', error);
      }
    };

    connectSocket();

    return () => {
      studySocketService.disconnect();
      setIsConnected(false);
    };
  }, [user]);

  // Setup socket event listeners
  useEffect(() => {
    if (!isConnected) return;

    studySocketService.onStudyJoined((data) => {
      setSelectedLocationId(data.locationId);
      setIsJoining(false);
    });

    studySocketService.onStudyLeft(() => {
      setSelectedLocationId(null);
      setParticipants([]);
    });

    studySocketService.onStudySynced((data) => {
      if (data.locationId) {
        setSelectedLocationId(data.locationId);
        setParticipants(data.participants || []);
      }
      setIsLoading(false);
    });

    studySocketService.onParticipantsUpdated((data) => {
      if (data.locationId === selectedLocationId) {
        setParticipants(data.participants);
      }
    });

    studySocketService.onStudyError((error) => {
      console.error('Study error:', error);
      setIsJoining(false);
    });

    return () => {
      studySocketService.removeAllStudyListeners();
    };
  }, [isConnected, selectedLocationId]);

  const handleJoinLocation = useCallback((locationId: string) => {
    setIsJoining(true);
    setShowLocationPicker(false);
    studySocketService.joinStudy(locationId);
  }, []);

  const handleLeaveLocation = useCallback(() => {
    if (selectedLocationId) {
      studySocketService.leaveStudy(selectedLocationId);
    }
  }, [selectedLocationId]);

  const getSelectedLocationName = () => {
    const location = locations.find(loc => loc.id === selectedLocationId);
    return location?.name || '위치 선택';
  };

  // Get display participants: top 3 by todayTotalMinutes + me (always separate)
  const getDisplayParticipants = () => {
    if (!user?.id) return { topThree: participants.slice(0, 4), me: null };

    const me = participants.find(p => p.userId === user.id);
    const others = participants
      .filter(p => p.userId !== user.id)
      .sort((a, b) => b.todayTotalMinutes - a.todayTotalMinutes)
      .slice(0, 3);

    return { topThree: others, me };
  };

  const formatMinutes = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}시간 ${mins}분`;
    }
    return `${mins}분`;
  };

  const { topThree, me } = getDisplayParticipants();
  const allDisplayed = me ? [...topThree, me] : topThree;
  const displayCount = allDisplayed.length;

  // Render participant card
  const renderParticipant = (participant: ParticipantInfo, isMe: boolean = false) => (
    <View key={participant.sessionId} style={[styles.participantCard, isMe && styles.myCard]}>
      <Text style={styles.emoji}>{participant.profileEmoji || '👤'}</Text>
      <Text style={[styles.nickname, isMe && styles.myNickname]} numberOfLines={1}>
        {participant.nickname}
        {isMe && ' (나)'}
      </Text>
      <Text style={styles.time}>{formatMinutes(participant.todayTotalMinutes)}</Text>
      {participant.currentProject && (
        <Text style={styles.project} numberOfLines={1}>{participant.currentProject}</Text>
      )}
    </View>
  );

  // Render participants based on count
  const renderParticipants = () => {
    if (displayCount === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialDesignIcons name="account-group-outline" size={48} color={COLORS.gray400} />
          <Text style={styles.emptyText}>아직 참가자가 없습니다</Text>
        </View>
      );
    }

    if (displayCount === 1) {
      // Center single participant
      return (
        <View style={styles.singleLayout}>
          {renderParticipant(allDisplayed[0], allDisplayed[0].userId === user?.id)}
        </View>
      );
    }

    if (displayCount === 2) {
      // Side by side
      return (
        <View style={styles.doubleLayout}>
          {allDisplayed.map(p => renderParticipant(p, p.userId === user?.id))}
        </View>
      );
    }

    if (displayCount === 3) {
      // Triangle: 1 on top, 2 on bottom
      return (
        <View style={styles.tripleLayout}>
          <View style={styles.tripleTop}>
            {renderParticipant(allDisplayed[0], allDisplayed[0].userId === user?.id)}
          </View>
          <View style={styles.tripleBottom}>
            {renderParticipant(allDisplayed[1], allDisplayed[1].userId === user?.id)}
            {renderParticipant(allDisplayed[2], allDisplayed[2].userId === user?.id)}
          </View>
        </View>
      );
    }

    // 4 participants: 2x2 grid
    return (
      <View style={styles.quadLayout}>
        <View style={styles.quadRow}>
          {renderParticipant(allDisplayed[0], allDisplayed[0].userId === user?.id)}
          {renderParticipant(allDisplayed[1], allDisplayed[1].userId === user?.id)}
        </View>
        <View style={styles.quadRow}>
          {renderParticipant(allDisplayed[2], allDisplayed[2].userId === user?.id)}
          {renderParticipant(allDisplayed[3], allDisplayed[3].userId === user?.id)}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스터디</Text>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
          <Text style={styles.statusText}>{isConnected ? '연결됨' : '연결 안됨'}</Text>
        </View>
      </View>

      {/* Location Selector */}
      <View style={styles.locationSection}>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowLocationPicker(!showLocationPicker)}
        >
          <MaterialDesignIcons name="map-marker" size={20} color={COLORS.primary} />
          <Text style={styles.locationText}>{getSelectedLocationName()}</Text>
          <MaterialDesignIcons
            name={showLocationPicker ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={COLORS.gray600}
          />
        </TouchableOpacity>

        {showLocationPicker && (
          <View style={styles.locationPicker}>
            {locations.map(location => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationOption,
                  location.id === selectedLocationId && styles.locationOptionSelected,
                ]}
                onPress={() => handleJoinLocation(location.id)}
              >
                <Text style={[
                  styles.locationOptionText,
                  location.id === selectedLocationId && styles.locationOptionTextSelected,
                ]}>
                  {location.name}
                </Text>
                {location.id === selectedLocationId && (
                  <MaterialDesignIcons name="check" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Participants Area */}
      <View style={styles.participantsContainer}>
        {isJoining ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.joiningText}>참가 중...</Text>
          </View>
        ) : selectedLocationId ? (
          <>
            {renderParticipants()}
            <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveLocation}>
              <MaterialDesignIcons name="exit-to-app" size={20} color={COLORS.error} />
              <Text style={styles.leaveButtonText}>나가기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialDesignIcons name="account-group" size={64} color={COLORS.gray300} />
            <Text style={styles.emptyStateTitle}>함께 공부해요!</Text>
            <Text style={styles.emptyStateDesc}>위치를 선택하면 다른 사람들과 함께 공부할 수 있습니다</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusConnected: {
    backgroundColor: COLORS.success,
  },
  statusDisconnected: {
    backgroundColor: COLORS.error,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  locationSection: {
    padding: SPACING.base,
    backgroundColor: COLORS.surface,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.gray50,
    borderRadius: BORDER_RADIUS.lg,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  locationPicker: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  locationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  locationOptionSelected: {
    backgroundColor: COLORS.primaryLight,
  },
  locationOptionText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
  },
  locationOptionTextSelected: {
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  participantsContainer: {
    flex: 1,
    padding: SPACING.base,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },
  emptyStateDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  joiningText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
  },
  participantCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.base,
    alignItems: 'center',
    width: (SCREEN_WIDTH - SPACING.base * 3) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  myCard: {
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  emoji: {
    fontSize: 40,
    marginBottom: SPACING.sm,
  },
  nickname: {
    fontSize: FONT_SIZES.base,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  myNickname: {
    color: COLORS.primary,
  },
  time: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontFamily: FONTS.mono,
  },
  project: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  singleLayout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doubleLayout: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.base,
  },
  tripleLayout: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.base,
  },
  tripleTop: {
    alignItems: 'center',
  },
  tripleBottom: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  quadLayout: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.base,
  },
  quadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.base,
  },
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: SPACING.md,
    marginTop: SPACING.base,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  leaveButtonText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.error,
    fontWeight: '500',
  },
});

export { CoStudyScreen };
export default CoStudyScreen;
