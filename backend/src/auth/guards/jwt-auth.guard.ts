import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

const DEV_USER_ID = 'dev-user-001';

// DEV_AUTH_BYPASS=true 환경변수가 설정된 경우에만 dev-token 허용
const isDevAuthBypass = () => process.env.DEV_AUTH_BYPASS === 'true';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // DEV_AUTH_BYPASS=true일 때만 dev-token 허용
    if (isDevAuthBypass() && authHeader === 'Bearer dev-token') {
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
