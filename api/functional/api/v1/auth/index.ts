/**
 * @packageDocumentation
 * @module api.functional.api.v1.auth
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection, Resolved, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";

import type {
  CreateUserDto,
  UserResponseDto,
  LoginUserDto,
} from "../../../../../libs/common/dto/auth/user.dto";

/**
 * 사용자 등록
 *
 * role: 'ADMIN' | 'USER' | 'OPERATOR' | 'AUDITOR'
 *
 * @tag auth
 * @summary 새로운 사용자를 등록합니다
 *
 * @controller AuthController.register
 * @path POST /api/v1/auth/register
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function register(
  connection: IConnection,
  _createUserDto: register.Input,
): Promise<register.Output> {
  return PlainFetcher.fetch(
    {
      ...connection,
      headers: {
        ...connection.headers,
        "Content-Type": "application/json",
      },
    },
    {
      ...register.METADATA,
      template: register.METADATA.path,
      path: register.path(),
    },
    _createUserDto,
  );
}
export namespace register {
  export type Input = Resolved<CreateUserDto>;
  export type Output = Primitive<UserResponseDto>;

  export const METADATA = {
    method: "POST",
    path: "/api/v1/auth/register",
    request: {
      type: "application/json",
      encrypted: false,
    },
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: 201,
  } as const;

  export const path = () => "/api/v1/auth/register";
}

/**
 * 사용자 로그인
 *
 * @tag auth
 * @summary 사용자 인증 및 JWT 토큰 발급
 *
 * @controller AuthController.login
 * @path POST /api/v1/auth/login
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function login(
  connection: IConnection,
  _loginUserDto: login.Input,
): Promise<login.Output> {
  return PlainFetcher.fetch(
    {
      ...connection,
      headers: {
        ...connection.headers,
        "Content-Type": "application/json",
      },
    },
    {
      ...login.METADATA,
      template: login.METADATA.path,
      path: login.path(),
    },
    _loginUserDto,
  );
}
export namespace login {
  export type Input = Resolved<LoginUserDto>;
  export type Output = Primitive<UserResponseDto>;

  export const METADATA = {
    method: "POST",
    path: "/api/v1/auth/login",
    request: {
      type: "application/json",
      encrypted: false,
    },
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: 201,
  } as const;

  export const path = () => "/api/v1/auth/login";
}
