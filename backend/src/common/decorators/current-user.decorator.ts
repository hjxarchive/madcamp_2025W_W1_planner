import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface FirebaseUser {
  firebaseUid: string;
  email?: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): FirebaseUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
