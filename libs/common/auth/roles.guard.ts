import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../schemas/user.schema';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ud544uc694ud55c uc5edud560 uac00uc838uc624uae30
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // uc5edud560uc774 uc9c0uc815ub418uc9c0 uc54auc740 uacbduc6b0 uc811uadfc ud5c8uc6a9
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // ud5e4ub354uac00 uc5c6ub294 uacbduc6b0 uc811uadfc uac70ubd80
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const token = authHeader.substring(7);

    try {
      // ud1a0ud070 uac80uc99d
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;

      // uc0acuc6a9uc790uc758 uc5edud560uc774 ud544uc694ud55c uc5edud560uc5d0 ud3ecud568ub418ub294uc9c0 ud655uc778
      const userRole = payload.role;

      // ADMINuc740 ubaa8ub4e0 uad8cud55c uc788uc74c
      if (userRole === UserRole.ADMIN) {
        return true;
      }

      return requiredRoles.some((role) => role === userRole);
    } catch (error) {
      throw new ForbiddenException('Invalid token or insufficient permissions');
    }
  }
}
