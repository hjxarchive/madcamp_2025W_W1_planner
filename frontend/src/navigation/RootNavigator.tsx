import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProjectDetailScreen } from '@screens/ProjectDetailScreen';
import { LoginScreen } from '@screens/LoginScreen';
import { NicknameSetupModal } from '@components/NicknameSetupModal';
import { COLORS } from '@constants/index';
import { useAuth } from '@contexts/AuthContext';

// Define the param list for type safety
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ProjectDetail: { projectId: string };
  AddTask: undefined;
  AddProject: undefined;
  Settings: undefined;
  Profile: undefined;
  StudyRoom: { roomId: string };
  CollabDetail: { projectId: string };
  ArchiveReceipt: { projectId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isNewUser, completeNewUserSetup, updateUser } = useAuth();

  const handleNicknameSetupComplete = (nickname: string, emoji: string) => {
    // Update user info in context
    updateUser({ nickname, profileEmoji: emoji });
    // Mark setup as complete
    completeNewUserSetup();
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
          animation: 'slide_from_right',
        }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
            <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>

      {/* Nickname Setup Modal for new users */}
      <NicknameSetupModal
        isOpen={isAuthenticated && isNewUser}
        onComplete={handleNicknameSetupComplete}
      />
    </>
  );
};

export default RootNavigator;
