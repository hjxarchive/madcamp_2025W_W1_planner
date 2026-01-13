import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

// 개발 모드에서 사용할 임시 사용자 ID
const DEV_FIREBASE_UID = 'dev-user-001';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // 개발 모드: 인증 우회 (DEV_MODE 환경변수 또는 특수 토큰)
    const isDev = process.env.NODE_ENV !== 'production';
    
    if (isDev) {
      // 개발 모드에서는 토큰이 없거나 'dev-token'이면 임시 사용자로 처리
      if (!authHeader || authHeader === 'Bearer dev-token') {
        request.user = {
          firebaseUid: DEV_FIREBASE_UID,
          email: 'dev@momento.app',
        };
        return true;
      }
    }

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 필요합니다');
    }

    const token = authHeader.split('Bearer ')[1];

    // 개발 모드에서 'dev-token' 사용 시
    if (isDev && token === 'dev-token') {
      request.user = {
        firebaseUid: DEV_FIREBASE_UID,
        email: 'dev@momento.app',
      };
      return true;
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      request.user = {
        firebaseUid: decodedToken.uid,
        email: decodedToken.email,
      };
      return true;
    } catch (error) {
      // 개발 모드에서는 Firebase 오류 시에도 임시 사용자로 처리
      if (isDev) {
        console.warn('Firebase 인증 실패, 개발 모드로 임시 사용자 사용');
        request.user = {
          firebaseUid: DEV_FIREBASE_UID,
          email: 'dev@momento.app',
        };
        return true;
      }
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
