# Gateway 서버 구현 세션 2

## 구현 목표

이벤트/리워드 관리 플랫폼의 NestJS 모노레포에서 Gateway 서버를 구현했습니다. 사용자 인증, 액션 모킹, 이벤트/리워드 관리, 리워드 요청/이력 API를 구현하고, 역할 기반 권한 관리, Typia를 활용한 DTO 검증, Nestia를 통한 Swagger 문서 자동화를 적용했습니다.

## 구현 내용

### 1. 프로젝트 구조 개선

- 경로 별칭(Path Aliases) 추가
  - `@libs/*`: 공통 라이브러리 접근 경로
  - `@shared/*`: 공유 모듈 접근 경로
- 게이트웨이 서버 실행 스크립트 추가
  - `yarn start:gateway`: 개발 환경 실행
  - `yarn start:gateway:live`: 운영 환경 실행
  - `yarn start:gateway:debug`: 디버그 모드 실행

### 2. 인증 서비스 개선

- Auth 서비스 타입 안전성 향상
  - `UserDocument` 타입을 `User`로 변경하여 일관성 유지
  - Axios 타입을 활용한 에러 처리 개선
- 역할 기반 접근 제어 확장
  - `OPERATOR`와 `AUDITOR` 역할 추가

### 3. MongoDB 연결 설정 개선

- MongoDB 설정 단순화 및 개선
  - 환경별(dev, live) 설정 관리 유지
  - 설정 함수 리팩토링으로 코드 가독성 향상
- NestJS 모듈 설정 개선
  - `MongooseModule.forRootAsync` 설정 최적화

### 4. 컨트롤러 구현

- Nestia를 활용한 타입 안전한 컨트롤러 구현
  - `@nestia/core`의 `TypedRoute`, `TypedBody` 사용
  - 일관된 컨트롤러 구조 유지
- API 버전 관리 적용
  - URI 경로에 버전 정보 포함 (`/api/v1/`)

### 5. 상수 관리 개선

- 타겟 타입 상수 추가
  - `TARGET_TYPES` 상수를 통한 중앙 집중식 관리
  - 타입 안전성 및 일관성 향상

### 6. 코드 포맷팅 및 스타일 개선

- 코드 포맷팅 적용
  - 들여쓰기 및 줄바꿈 일관성 유지
  - 긴 임포트 구문 정리

## 주요 파일 구조

```
/apps
  /gateway
    /src
      /actions
        actions.controller.ts  # 액션 컨트롤러
        actions.module.ts     # 액션 모듈
        actions.service.ts    # 액션 서비스
      /auth
        auth.controller.ts    # 인증 컨트롤러
        auth.module.ts       # 인증 모듈
        auth.service.ts      # 인증 서비스
      /events
        events.controller.ts  # 이벤트 컨트롤러
        events.module.ts     # 이벤트 모듈
        events.service.ts    # 이벤트 서비스
      /rewards
        rewards.controller.ts  # 리워드 컨트롤러
        rewards.module.ts     # 리워드 모듈
        rewards.service.ts    # 리워드 서비스
      main.module.ts         # 메인 모듈
      main.ts               # 엔트리 포인트
    tsconfig.app.json       # TypeScript 설정
    package.json           # 패키지 정보
/libs
  /common
    /constants
      events.ts            # 이벤트 상수
    /config
      jwt.config.ts        # JWT 설정
      mongodb.config.ts    # MongoDB 설정
    /schemas
      user.schema.ts       # 사용자 스키마
      condition.schema.ts   # 조건 스키마
      event.schema.ts      # 이벤트 스키마
      reward.schema.ts     # 리워드 스키마
  /shared
    /src
      /dtos
        action.dto.ts      # 액션 DTO
        condition.dto.ts   # 조건 DTO
        event.dto.ts       # 이벤트 DTO
        reward.dto.ts      # 리워드 DTO
/http
  gateway.http           # HTTP 테스트 파일
```

## 구현 특징

1. **모듈화**: 공통 코드를 `@libs`와 `@shared` 경로 별칭으로 접근하여 재사용성 향상
2. **타입 안전성**: Nestia와 Typia를 활용한 타입 안전한 API 구현
3. **일관된 구조**: 모든 컨트롤러가 동일한 구조를 따르도록 설계
4. **상수 관리**: 문자열 리터럴 대신 상수를 사용하여 일관성 유지
5. **환경별 설정**: 개발(dev)과 운영(live) 환경에 따른 구성 설정 관리

## 테스트 방법

1. 서버 실행:
   ```bash
   yarn start:gateway  # 개발 환경 (dev)
   yarn start:gateway:live  # 운영 환경 (live)
   ```

2. HTTP 테스트:
   ```bash
   # 사용자 등록
   curl -X POST http://localhost:3002/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "role": "user"
     }'

   # 사용자 로그인
   curl -X POST http://localhost:3002/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

## 향후 계획

1. 리워드 요청 및 이력 API 테스트 및 최적화
2. 조건 체커 서비스 기능 확장
3. 사용자 액션 모킹 기능 개선
4. 이벤트 및 리워드 관리 UI 개발
5. 성능 최적화 및 캐싱 전략 구현