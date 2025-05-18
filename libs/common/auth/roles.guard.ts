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
    // Get required roles from metadata
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Allow access if no roles are specified
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    // Deny access if authorization header is missing
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token is missing');
    }

    const token = authHeader.substring(7);

    try {
      // Verify token
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;

      // Check if user's role is included in the required roles
      const userRole = payload.role;

      // ADMIN has access to all routes
      if (userRole === UserRole.ADMIN) {
        return true;
      }

      return requiredRoles.some((role) => role === userRole);
    } catch (error) {
      throw new ForbiddenException('Invalid token or insufficient permissions');
    }
  }
}
