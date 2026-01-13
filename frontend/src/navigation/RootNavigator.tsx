import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ProjectDetailScreen } from '@screens/ProjectDetailScreen';
import { COLORS } from '@constants/index';

// Define the param list for type safety
export type RootStackParamList = {
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
