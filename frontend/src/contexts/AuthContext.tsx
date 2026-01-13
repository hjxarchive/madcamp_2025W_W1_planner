import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { authService, AuthUser } from '@services/auth';
import socketService from '@services/socket';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 인증 상태 복원
  useEffect(() => {
    const init = async () => {
      try {
        const savedUser = await authService.initialize();
        if (savedUser) {
          setUser(savedUser);
          // WebSocket 연결
          const token = await authService.getValidAccessToken();
          if (token) {
            try {
              await socketService.connect(token);
            } catch (error) {
              console.warn('[AuthContext] WebSocket connection failed:', error);
            }
          }
        }
      } catch (error) {
        console.error('[AuthContext] Init failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await authService.signInWithGoogle();
      setUser(result.user);

      // WebSocket 연결
      try {
        await socketService.connect(result.accessToken);
      } catch (error) {
        console.warn('[AuthContext] WebSocket connection failed:', error);
      }

      if (result.isNewUser) {
        Alert.alert('환영합니다!', 'Momento에 오신 것을 환영합니다.');
      }
    } catch (error: any) {
      Alert.alert('로그인 실패', error.message || '다시 시도해주세요.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      // WebSocket 연결 해제
      socketService.disconnect();

      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('[AuthContext] Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser(prev => (prev ? { ...prev, ...updates } : null));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signInWithGoogle,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
