import { createParamDecorator, ExecutionContext } from '@nestjs/common';

type user = {
  userId: string;
  type: string;
};

export type UserFromToken = {
  user: user;
};
export type UserTokenKeys = keyof UserFromToken;

export const AuthUser = createParamDecorator(
  (tokenKey: UserTokenKeys, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & UserFromToken>();

    const userFromToken = {
      userId: request.user.userId,
      type: request.user.type,
    } as user;

    return !!tokenKey ? userFromToken.userId : userFromToken;
  },
);
