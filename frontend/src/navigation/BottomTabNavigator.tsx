import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MaterialDesignIcons from '@react-native-vector-icons/material-design-icons';
const Icon = MaterialDesignIcons;
import { HomeScreen, PastScreen, StudyScreen } from '@screens/index';
import { COLORS, TAB_NAMES, FONT_SIZES, SPACING } from '@constants/index';

const Tab = createBottomTabNavigator();

interface TabIconProps {
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => {
  const iconMap: Record<string, { active: string; inactive: string }> = {
    [TAB_NAMES.MAIN]: { active: 'clock', inactive: 'clock-outline' },
    [TAB_NAMES.REPORT]: { active: 'chart-bar', inactive: 'chart-bar' },
    [TAB_NAMES.ARCHIVE]: { active: 'calendar', inactive: 'calendar-outline' },
  };

  const icons = iconMap[name] || { active: 'circle', inactive: 'circle-outline' };
  const iconName = focused ? icons.active : icons.inactive;

  return (
    <Icon
      name={iconName as any}
      size={22}
      color={focused ? COLORS.gray900 : COLORS.gray400}
    />
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.gray900,
        tabBarInactiveTintColor: COLORS.gray400,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Main"
        component={HomeScreen}
        options={{
          tabBarLabel: TAB_NAMES.MAIN,
          tabBarIcon: ({ focused }) => <TabIcon name={TAB_NAMES.MAIN} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Report"
        component={PastScreen}
        options={{
          tabBarLabel: TAB_NAMES.REPORT,
          tabBarIcon: ({ focused }) => <TabIcon name={TAB_NAMES.REPORT} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Archive"
        component={StudyScreen}
        options={{
          tabBarLabel: TAB_NAMES.ARCHIVE,
          tabBarIcon: ({ focused }) => <TabIcon name={TAB_NAMES.ARCHIVE} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    elevation: 0,
    shadowOpacity: 0,
    height: 70,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  tabBarLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '500',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: SPACING.xs,
  },
});

export default BottomTabNavigator;
