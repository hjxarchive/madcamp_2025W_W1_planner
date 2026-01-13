import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  AUTH_TOKEN: '@momento/auth_token',
  USER_DATA: '@momento/user_data',
  DAILY_GOAL: '@momento/daily_goal',
  TIMER_STATE: '@momento/timer_state',
  SETTINGS: '@momento/settings',
} as const;

class StorageService {
  // ============ Auth ============
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  }

  async getAuthToken(): Promise<string | null> {
    return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  async removeAuthToken(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  // ============ User Data ============
  async setUserData(user: any): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  async getUserData(): Promise<any | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  async removeUserData(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
  }

  // ============ Daily Goal ============
  async setDailyGoal(hours: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, String(hours));
  }

  async getDailyGoal(): Promise<number> {
    const goal = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL);
    return goal ? parseInt(goal, 10) : 8; // Default 8 hours
  }

  // ============ Timer State ============
  async setTimerState(state: {
    isRunning: boolean;
    startTime: number | null;
    accumulatedTime: number;
    currentTaskId: string | null;
  }): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TIMER_STATE, JSON.stringify(state));
  }

  async getTimerState(): Promise<{
    isRunning: boolean;
    startTime: number | null;
    accumulatedTime: number;
    currentTaskId: string | null;
  } | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TIMER_STATE);
    return data ? JSON.parse(data) : null;
  }

  async clearTimerState(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_STATE);
  }

  // ============ Settings ============
  async setSettings(settings: Record<string, any>): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  async getSettings(): Promise<Record<string, any>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  }

  async updateSetting(key: string, value: any): Promise<void> {
    const settings = await this.getSettings();
    settings[key] = value;
    await this.setSettings(settings);
  }

  // ============ Clear All ============
  async clearAll(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }
}

export const storage = new StorageService();
export default storage;
