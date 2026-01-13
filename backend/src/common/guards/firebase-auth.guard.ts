import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

// 개발 모드에서 사용할 임시 사용자 ID
const DEV_FIREBASE_UID = 'dev-user-001';

// DEV_AUTH_BYPASS=true 환경변수가 설정된 경우에만 dev-token 허용
const isDevAuthBypass = () => process.env.DEV_AUTH_BYPASS === 'true';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('인증 토큰이 필요합니다');
    }

    const token = authHeader.split('Bearer ')[1];

    // DEV_AUTH_BYPASS=true일 때만 dev-token 허용
    if (isDevAuthBypass() && token === 'dev-token') {
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
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
