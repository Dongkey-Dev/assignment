import { UserRole } from '@libs/common/schemas/user.schema';
import { tags } from 'typia';
/**
 * 사용자 생성 DTO
 * @tag auth
 * @summary 사용자 등록에 사용되는 DTO
 */
export interface CreateUserDto {
  /**
   * 사용자 이메일
   */
  email: string & tags.Format<'email'>;

  /**
   * 사용자 비밀번호
   * @minLength 6
   */
  password: string;

  /**
   * 사용자 역할
   * @default "user"
   */
  role?: UserRole;
}

/**
 * 사용자 로그인 DTO
 * @tag auth
 * @summary 사용자 로그인에 사용되는 DTO
 */
export interface LoginUserDto {
  /**
   * 사용자 이메일
   */
  email: string & tags.Format<'email'>;

  /**
   * 사용자 비밀번호
   */
  password: string;
}

/**
 * 사용자 응답 DTO
 * @tag auth
 * @summary 사용자 정보 응답에 사용되는 DTO
 */
export interface UserResponseDto {
  /**
   * 사용자 ID
   */
  id: string;

  /**
   * 사용자 이메일
   */
  email: string & tags.Format<'email'>;

  /**
   * 사용자 역할
   */
  role: UserRole;

  /**
   * JWT 토큰
   */
  token: string;
}
