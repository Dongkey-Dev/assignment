import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '@libs/common/schemas/user.schema';
import {
  CreateUserDto,
  LoginUserDto,
  UserResponseDto,
} from '../../../../libs/common/dto/auth/user.dto';
import { USER } from '../../../../libs/common/constants/events';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 사용자를 등록합니다.
   * @param createUserDto 사용자 등록 DTO
   * @returns 등록된 사용자 정보와 JWT 토큰
   */
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, role } = createUserDto;

    // 이메일 중복 확인
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser) {
      throw new BadRequestException('이미 등록된 이메일입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 생성
    const newUser = await this.userModel.create({
      email,
      password: hashedPassword,
      role,
    });

    // 이벤트 발행은 제외 (USER.CREATED 상수만 정의)
    console.log(`User created: ${USER.CREATED}`);

    // JWT 토큰 생성
    const token = this.generateToken(newUser);

    return {
      id: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      token,
    };
  }

  /**
   * 사용자 로그인을 처리합니다.
   * @param loginUserDto 로그인 DTO
   * @returns 사용자 정보와 JWT 토큰
   */
  async login(loginUserDto: LoginUserDto): Promise<UserResponseDto> {
    const { email, password } = loginUserDto;

    // 사용자 찾기
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );
    }

    // JWT 토큰 생성
    const token = this.generateToken(user);

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      token,
    };
  }

  /**
   * JWT 토큰을 생성합니다.
   * @param user 사용자 정보
   * @returns JWT 토큰
   */
  private generateToken(user: UserDocument): string {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET || 'DEV_TEMP_SECRET',
      expiresIn: '1d',
    });
  }
}
