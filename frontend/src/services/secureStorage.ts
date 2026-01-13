import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({
  id: 'momento-secure-storage',
  encryptionKey: 'momento-encryption-key-v1',
});

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth:accessToken',
  REFRESH_TOKEN: 'auth:refreshToken',
  TOKEN_EXPIRY: 'auth:tokenExpiry',
  USER_DATA: 'auth:userData',
} as const;

export interface AuthUser {
  id: string;
  firebaseUid: string;
  nickname: string;
  profileEmoji: string | null;
}

class SecureStorageService {
  // Access Token
  setAccessToken(token: string): void {
    storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  getAccessToken(): string | undefined {
    return storage.getString(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Refresh Token
  setRefreshToken(token: string): void {
    storage.set(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  getRefreshToken(): string | undefined {
    return storage.getString(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Token Expiry (timestamp in ms)
  setTokenExpiry(expiryMs: number): void {
    storage.set(STORAGE_KEYS.TOKEN_EXPIRY, expiryMs);
  }

  getTokenExpiry(): number | undefined {
    return storage.getNumber(STORAGE_KEYS.TOKEN_EXPIRY);
  }

  // User Data
  setUserData(user: AuthUser): void {
    storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  getUserData(): AuthUser | null {
    const data = storage.getString(STORAGE_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  }

  // Clear all auth data
  clearAuth(): void {
    storage.delete(STORAGE_KEYS.ACCESS_TOKEN);
    storage.delete(STORAGE_KEYS.REFRESH_TOKEN);
    storage.delete(STORAGE_KEYS.TOKEN_EXPIRY);
    storage.delete(STORAGE_KEYS.USER_DATA);
  }

  // Check if tokens exist
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }
}

export const secureStorage = new SecureStorageService();
export default secureStorage;
