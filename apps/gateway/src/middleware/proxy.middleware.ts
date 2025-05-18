import {
  Injectable,
  NestMiddleware,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import axios, { AxiosRequestConfig, Method } from 'axios';
import {
  ROUTE_MAP,
  PUBLIC_ROUTES,
  PATH_ROLE_MAP,
  PATH_PATTERNS,
} from '@libs/constants/routes';
import { UserRole } from '@libs/common/schemas/user.schema';

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ProxyMiddleware.name);

  constructor(private readonly jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { path, method } = req;

    this.logger.log(`Received request: ${method} ${path}`);

    // 요청 경로에 맞는 대상 서버 찾기
    const routeConfig = this.findTargetRoute(path);
    if (!routeConfig) {
      this.logger.warn(`No route configuration found for path: ${path}`);
      return res.status(404).json({ message: 'Not Found' });
    }

    // 인증 제외 경로 확인
    const isPublicRoute = this.isPublicRoute(path, method);

    // 인증 처리 (공개 경로가 아닌 경우)
    if (!isPublicRoute) {
      try {
        // JWT 토큰 검증
        const token = this.extractToken(req);
        if (!token) {
          throw new UnauthorizedException('JWT token is missing');
        }

        // 토큰 검증 및 사용자 정보 추출
        const payload = await this.jwtService.verifyAsync(token);
        req['user'] = payload;

        // 역할 기반 접근 제어 (RBAC)
        // 경로와 메서드를 함께 고려하여 권한 확인
        const normalizedPath = this.normalizePath(req.path);
        const roleKey = `${normalizedPath}:${req.method}`;
        if (!this.hasRequiredRole(roleKey, payload.roles)) {
          throw new ForbiddenException('Insufficient permissions');
        }
      } catch (error) {
        if (
          error instanceof UnauthorizedException ||
          error.name === 'JsonWebTokenError' ||
          error.name === 'TokenExpiredError'
        ) {
          this.logger.error(`Authentication error: ${error.message}`);
          return res.status(401).json({ message: 'Unauthorized' });
        }

        if (error instanceof ForbiddenException) {
          this.logger.error(`Authorization error: ${error.message}`);
          return res.status(403).json({ message: 'Forbidden' });
        }

        this.logger.error(
          `Unexpected error during authentication: ${error.message}`,
        );
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }

    // 프록시 요청 처리
    try {
      const targetUrl = this.getTargetServer(path);
      const response = await this.forwardRequest(req, targetUrl);

      // 응답 헤더 설정
      Object.entries(response.headers).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      // 응답 상태 코드 및 본문 설정
      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error(`Error forwarding request: ${error.message}`);

      if (error.response) {
        // 대상 서버에서 오는 에러 응답 그대로 전달
        const { status, data } = error.response;
        return res.status(status).json(data);
      }

      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }

  private findTargetRoute(path: string) {
    return ROUTE_MAP.find((route) => path.startsWith(route.prefix));
  }

  private isPublicRoute(path: string, method: string): boolean {
    return PUBLIC_ROUTES.some(
      (route) => route.path === path && route.method === method,
    );
  }

  private extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // 'Bearer ' 이후의 토큰 부분 추출
  }

  private hasRequiredRole(roleKey: string, userRoles: UserRole[]): boolean {
    // 정확한 경로+메서드 매칭 확인
    if (PATH_ROLE_MAP[roleKey]) {
      const requiredRoles = PATH_ROLE_MAP[roleKey];
      return userRoles.some((role) => requiredRoles.includes(role));
    }
    // 기본적으로 모든 인증된 사용자에게 접근 허용 (필요에 따라 변경 가능)
    return true;
  }

  /**
   * 경로에서 HTTP 메서드 추출 (path에 메서드가 포함되어 있지 않은 경우 기본값 'GET' 반환)
   */
  private getRequestMethod(path: string): string {
    const methodMatch = path.match(/:([A-Z]+)$/);
    return methodMatch ? methodMatch[1] : 'GET';
  }

  /**
   * 와일드카드나 파라미터가 포함된 경로를 정규화
   * 예: '/api/v1/rewards/123' -> '/api/v1/rewards/:id'
   */
  private normalizePath(path: string): string {
    // 메서드 부분 제거
    const pathWithoutMethod = path.replace(/:[A-Z]+$/, '');
    // 패턴 매칭을 통해 경로 정규화
    for (const { pattern, paramRegex } of PATH_PATTERNS) {
      if (paramRegex.test(pathWithoutMethod)) {
        return pattern;
      }
    }
    // 매칭되는 패턴이 없으면 원래 경로 반환
    return pathWithoutMethod;
  }

  private getTargetServer(path: string): string {
    // 경로에 따른 대상 서버 결정
    const normalizedPath = this.normalizePath(path);
    // 패턴 매칭을 통해 서버 결정
    for (const route of ROUTE_MAP) {
      if (normalizedPath.startsWith(route.prefix)) {
        return route.target;
      }
    }
    // 기본값은 첫 번째 라우트의 대상 서버
    return ROUTE_MAP[0]?.target || '';
  }

  private async forwardRequest(req: Request, targetUrl: string) {
    const { method, path, body, headers, query } = req;

    // 원래 요청 경로에서 API 버전 접두사를 유지하면서 대상 서버 URL 생성
    const url = `${targetUrl}${path}`;

    // 요청 설정
    const config: AxiosRequestConfig = {
      method: method as Method,
      url,
      data: body,
      params: query,
      headers: {
        ...headers,
        host: new URL(targetUrl).host, // 호스트 헤더 업데이트
      },
    };

    // 'content-length' 헤더 제거 (axios가 자동으로 계산)
    if (config.headers) {
      delete config.headers['content-length'];
    }

    this.logger.log(`Forwarding request to: ${method} ${url}`);
    return axios(config);
  }
}
