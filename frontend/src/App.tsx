import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from '@navigation/index';
import { COLORS } from '@constants/index';
import { TimerProvider } from '@contexts/TimerContext';
import { AuthProvider } from '@contexts/AuthContext';

const App: React.FC = () => {
  return (
    <GestureHandlerRootView style={styles.container}>
      <AuthProvider>
        <TimerProvider>
          <SafeAreaProvider>
            <StatusBar
              barStyle="dark-content"
              backgroundColor={COLORS.background}
              translucent={false}
            />
            <NavigationContainer
              theme={{
                dark: false,
                colors: {
                  primary: COLORS.primary,
                  background: COLORS.background,
                  card: COLORS.surface,
                  text: COLORS.textPrimary,
                  border: COLORS.border,
                  notification: COLORS.error,
                },
              }}>
              <RootNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </TimerProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export default App;
