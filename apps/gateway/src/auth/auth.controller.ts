import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody } from '@nestia/core';
import {
  CreateUserDto,
  LoginUserDto,
  UserResponseDto,
} from '@libs/common/dto/auth/user.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor() {}

  /**
   * 사용자 등록
   *
   * role: 'ADMIN' | 'USER' | 'OPERATOR' | 'AUDITOR'
   *
   * @tag auth
   * @summary 새로운 사용자를 등록합니다
   */
  @TypedRoute.Post('register')
  async register(
    @TypedBody() _createUserDto: CreateUserDto,
  ): Promise<UserResponseDto> {
    return {} as unknown as UserResponseDto;
  }

  /**
   * 사용자 로그인
   * @tag auth
   * @summary 사용자 인증 및 JWT 토큰 발급
   */
  @TypedRoute.Post('login')
  async login(
    @TypedBody() _loginUserDto: LoginUserDto,
  ): Promise<UserResponseDto> {
    return {} as unknown as UserResponseDto;
  }
}
