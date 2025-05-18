import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  CreateUserDto,
  LoginUserDto,
  UserResponseDto,
} from '@libs/common/dto/auth/user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  private readonly authServiceUrl =
    process.env.AUTH_SERVICE_URL || 'http://localhost:3001/api/v1/auth';

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    try {
      const response = await firstValueFrom<AxiosResponse<UserResponseDto>>(
        this.httpService.post(`${this.authServiceUrl}/register`, createUserDto),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new HttpException(
          (axiosError.response.data as any)?.message || 'Registration failed',
          axiosError.response.status || HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    try {
      const response = await firstValueFrom<AxiosResponse<UserResponseDto>>(
        this.httpService.post(`${this.authServiceUrl}/login`, loginUserDto),
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        throw new HttpException(
          (axiosError.response.data as any)?.message || 'Login failed',
          axiosError.response.status || HttpStatus.UNAUTHORIZED,
        );
      }
      throw new HttpException(
        'Auth service unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const response = await firstValueFrom<AxiosResponse<any>>(
        this.httpService.get(`${this.authServiceUrl}/validate`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      );
      return response.data;
    } catch (error) {
      return null;
    }
  }
}
