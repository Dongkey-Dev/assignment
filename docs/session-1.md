# Session 1: NestJS 인증 시스템 구현

## 작업 요약

이 세션에서는 NestJS 모노레포에서 인증 시스템을 구현했습니다. 주요 기능으로 사용자 등록 및 로그인, JWT 토큰 발급, 이벤트 처리, 그리고 Swagger 문서 생성이 포함되었습니다. Nestia를 사용하여 타입 안전한 API를 구현하고, 타입 기반 검증을 적용했습니다.

## 구현된 기능

### 사용자 인증
- **사용자 등록**: `POST /auth/register` 엔드포인트 구현
- **사용자 로그인**: `POST /auth/login` 엔드포인트 구현
- **JWT 인증**: 토큰 생성 및 검증 로직 구현

### 이벤트 처리
- BullMQ 대신 `@nestjs/event-emitter`를 사용하여 이벤트 처리
- 사용자 생성 시 `user.created` 이벤트 발생

### 데이터 검증
- Nestia의 타입 태그를 사용한 DTO 검증 구현
- 이메일 형식, 비밀번호 길이 등 자동 검증

### Swagger 문서화
- Nestia를 사용한 API 문서 자동 생성
- 멀티 서비스 지원 Swagger UI 서버 구현

## 프로젝트 구조

### 모노레포 구성
- **apps/auth**: 인증 서비스
- **libs/shared**: 공유 라이브러리 (DTO, 설정 등)
- **executable/swagger.ts**: Swagger UI 서버

### 주요 파일

#### Auth 서비스
- **auth.controller.ts**: 인증 엔드포인트 정의
- **auth.service.ts**: 인증 비즈니스 로직
- **auth.module.ts**: 모듈 설정
- **schemas/user.schema.ts**: MongoDB 사용자 스키마

#### 공유 라이브러리
- **dtos/user.dto.ts**: 사용자 관련 DTO 및 검증 규칙
- **config/index.ts**: 공유 설정

## 기술 스택

- **NestJS**: 백엔드 프레임워크
- **MongoDB**: 데이터베이스
- **Mongoose**: ODM
- **JWT**: 인증
- **EventEmitter**: 이벤트 처리
- **Nestia**: API 타입 안전성 및 문서화
- **Docker**: 컨테이너화

## 구현 세부 사항

### 타입 기반 검증
```typescript
export interface CreateUserDto {
  /**
   * User's email address
   */
  email: string & tags.Format<'email'>;

  /**
   * User's password (minimum 8 characters)
   */
  password: string & tags.MinLength<8>;

  /**
   * User's role in the system
   */
  role: UserRole;
}
```

### 에러 처리
- `TypedException` 데코레이터를 사용한 예외 처리
- 비표준 형식에서 표준 형식으로 업데이트

```typescript
@TypedException<HttpError>({
  status: 400,
  description: '잘못된 요청',
  example: { message: '잘못된 사용자 데이터' },
})
```

### Swagger 설정
- 멀티 서비스 지원 설정
- 보안 스키마 설정 (Bearer 인증)

## 해결된 문제

1. **모듈 해결 문제**: `@event-reward/shared` 모듈 참조 문제 해결
2. **Swagger 생성 오류**: Nestia 설정 문제 해결
3. **타입 검증**: 수동 검증에서 타입 기반 자동 검증으로 전환
4. **Swagger UI**: 멀티 서비스 지원 서버 구현 및 경로 해결 문제 수정

## 다음 단계

1. **RBAC 구현**: 역할 기반 접근 제어 시스템 구현
2. **Gateway 서비스**: API 게이트웨이 구현
3. **Event 서비스**: 이벤트 처리 서비스 구현
4. **테스트 작성**: 단위 및 통합 테스트 추가

## 참고 사항

- Nestia 설정은 `apps/auth/nestia.config.ts`에 정의
- Swagger UI는 `http://localhost:37812/api-docs`에서 접근 가능
- 인증 서비스는 포트 3001에서 실행