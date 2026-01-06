import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface CurrentUser {
  userId: string;
  email: string;
  role: Role;
}

export const GetCurrentUser = createParamDecorator(
  (
    data: keyof CurrentUser | undefined,
    ctx: ExecutionContext,
  ): CurrentUser | CurrentUser[keyof CurrentUser] => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUser }>();
    const user: CurrentUser = request.user;

    return data ? user[data] : user;
  },
);
