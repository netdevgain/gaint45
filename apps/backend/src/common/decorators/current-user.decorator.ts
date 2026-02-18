import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface AuthUserPayload {
  sub: string;
  email: string;
  role: Role;
}

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AuthUserPayload => {
  const request = context.switchToHttp().getRequest<{ user: AuthUserPayload }>();
  return request.user;
});

