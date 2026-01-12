import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProjectDetailScreen } from '@screens/ProjectDetailScreen';
import LoginScreen from '@screens/LoginScreen';
import { COLORS } from '@constants/index';
import { useAuth } from '@contexts/AuthContext';

// Define the param list for type safety
export type RootStackParamList = {
  // Auth screens
  Login: undefined;

  // Main screens
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
  const { isAuthenticated, isLoading } = useAuth();

  // 로딩 중일 때 스플래시 화면 표시
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      {isAuthenticated ? (
        // 로그인된 사용자: 메인 화면
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
        </>
      ) : (
        // 로그인 안된 사용자: 로그인 화면
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: 'fade' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
