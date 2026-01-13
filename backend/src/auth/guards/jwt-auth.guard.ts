import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const DEV_USER_ID = 'dev-user-001';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    const isDev = process.env.NODE_ENV !== 'production';

    // 개발 모드: dev-token 허용
    if (isDev && (!authHeader || authHeader === 'Bearer dev-token')) {
      request.user = {
        id: DEV_USER_ID,
        firebaseUid: DEV_USER_ID,
        email: 'dev@momento.app',
      };
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('인증이 필요합니다');
    }
    return user;
  }
}
