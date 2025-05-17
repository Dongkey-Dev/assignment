import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypedRoute, TypedBody } from '@nestia/core';
import {
  CreateUserDto,
  LoginUserDto,
  UserResponseDto,
} from '@libs/common/dto/auth/user.dto';

/**
 * @tag public
 * @security bearer
 */
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 사용자 등록
   * @summary 새로운 사용자를 등록합니다
   */
  @TypedRoute.Post('register')
  async register(
    @TypedBody() createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  /**
   * 사용자 로그인
   * @summary 사용자 인증 및 JWT 토큰 발급
   */
  @TypedRoute.Post('login')
  async login(
    @TypedBody() loginUserDto: LoginUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.login(loginUserDto);
  }
}
