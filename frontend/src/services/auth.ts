import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { API_BASE_URL } from '@constants/index';
import { secureStorage, AuthUser } from './secureStorage';
import { api } from './api';

// Google Sign-In 설정
// webClientId는 Firebase Console > Authentication > Sign-in method > Google에서 확인
GoogleSignin.configure({
  webClientId:
    '380320770757-o7h9ckbrk4bg4tk6nfta98dl5a269omf.apps.googleusercontent.com',
  offlineAccess: true,
});

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: AuthUser;
  isNewUser?: boolean;
}

class AuthService {
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<AuthResponse> | null = null;

  // Google Sign-In
  async signInWithGoogle(): Promise<AuthResponse> {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();

      if (!idToken) {
        throw new Error('Google ID 토큰을 가져올 수 없습니다');
      }

      // Google ID 토큰을 서버에 전송하여 JWT 교환
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || '로그인에 실패했습니다');
      }

      const data: AuthResponse = await response.json();
      await this.saveTokens(data);
      this.startAutoRefresh();

      return data;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error('로그인이 취소되었습니다');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error('로그인이 진행 중입니다');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error('Google Play 서비스를 사용할 수 없습니다');
      }
      throw error;
    }
  }

  // 토큰 갱신
  async refreshTokens(): Promise<AuthResponse> {
    // 동시 갱신 요청 방지
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this._doRefreshTokens();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _doRefreshTokens(): Promise<AuthResponse> {
    const refreshToken = secureStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('리프레시 토큰이 없습니다');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // 갱신 실패, 토큰 정리
      this.stopAutoRefresh();
      secureStorage.clearAuth();
      throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
    }

    const data: AuthResponse = await response.json();
    await this.saveTokens(data);

    return data;
  }

  // 로그아웃
  async logout(): Promise<void> {
    this.stopAutoRefresh();

    const refreshToken = secureStorage.getRefreshToken();

    if (refreshToken) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.warn('[Auth] Logout API call failed:', error);
      }
    }

    // Google 로그아웃
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn('[Auth] Google sign out failed:', error);
    }

    secureStorage.clearAuth();
    api.setToken(null);
  }

  // 인증 여부 확인
  isAuthenticated(): boolean {
    return secureStorage.hasTokens();
  }

  // 유효한 액세스 토큰 가져오기 (필요시 자동 갱신)
  async getValidAccessToken(): Promise<string | null> {
    const accessToken = secureStorage.getAccessToken();
    const expiry = secureStorage.getTokenExpiry();

    if (!accessToken || !expiry) {
      return null;
    }

    // 만료 5분 전이면 갱신
    const fiveMinutesMs = 5 * 60 * 1000;
    if (Date.now() + fiveMinutesMs >= expiry) {
      try {
        const result = await this.refreshTokens();
        return result.accessToken;
      } catch (error) {
        return null;
      }
    }

    return accessToken;
  }

  // 토큰 저장
  private async saveTokens(data: AuthResponse): Promise<void> {
    secureStorage.setAccessToken(data.accessToken);
    secureStorage.setRefreshToken(data.refreshToken);

    // 만료 시간 계산 (현재 시간 + expiresIn 초)
    const expiryMs = Date.now() + data.expiresIn * 1000;
    secureStorage.setTokenExpiry(expiryMs);

    secureStorage.setUserData(data.user);

    // API 클라이언트 토큰 업데이트
    api.setToken(data.accessToken);
  }

  // 자동 갱신 타이머 (4분마다)
  startAutoRefresh(): void {
    this.stopAutoRefresh();

    const REFRESH_INTERVAL = 4 * 60 * 1000; // 4분

    this.refreshTimer = setInterval(async () => {
      try {
        const expiry = secureStorage.getTokenExpiry();
        const fiveMinutesMs = 5 * 60 * 1000;

        // 만료 5분 전이면 갱신
        if (expiry && Date.now() + fiveMinutesMs >= expiry) {
          console.log('[Auth] Auto-refreshing tokens...');
          await this.refreshTokens();
        }
      } catch (error) {
        console.error('[Auth] Auto-refresh failed:', error);
      }
    }, REFRESH_INTERVAL);
  }

  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // 앱 시작 시 인증 상태 복원
  async initialize(): Promise<AuthUser | null> {
    if (!this.isAuthenticated()) {
      return null;
    }

    try {
      const accessToken = await this.getValidAccessToken();

      if (!accessToken) {
        return null;
      }

      api.setToken(accessToken);
      this.startAutoRefresh();

      return secureStorage.getUserData();
    } catch (error) {
      console.error('[Auth] Initialization failed:', error);
      secureStorage.clearAuth();
      return null;
    }
  }
}

export const authService = new AuthService();
export { AuthUser };
export default authService;
