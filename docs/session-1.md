# Auth 서버 구현 세션 1

## 구현 목표

이벤트/리워드 관리 플랫폼의 NestJS 모노레포에서 Auth 서버의 사용자 등록(POST /api/v1/auth/register)과 로그인(POST /api/v1/auth/login) 기능을 구현하였습니다. Nestia를 사용하여 타입 안전한 컨트롤러와 Swagger 문서를 생성하고, Typia 태그로 DTO 검증, JWT를 활용한 인증 시스템을 구현하였습니다.

## 구현 내용

### 1. 영속성 관리

- MongoDB 연결 설정 구현 (`libs/config/mongodb.config.ts`)
  - 환경별(dev, live) 설정 관리
- 사용자 스키마 정의 (`libs/common/schemas/user.schema.ts`)
  - 이메일, 비밀번호, 역할 정보 포함
  - 스키마를 libs 디렉토리로 이동하여 재사용성 향상

### 2. 인증 기능

- JWT 설정 구현 (`libs/common/config/jwt.config.ts`)
  - 환경별 설정 관리
  - 토큰 만료 시간 설정
- JWT 전략 구현 (`libs/common/auth/jwt.strategy.ts`)
  - 토큰 추출 및 검증 로직
- JWT 가드 구현 (`libs/common/auth/jwt.guard.ts`)
  - 보호된 라우트 접근 제어

### 3. DTO 정의

- 사용자 DTO 정의 (`libs/common/dto/auth/user.dto.ts`)
  - `CreateUserDto`: 사용자 등록 DTO
  - `LoginUserDto`: 사용자 로그인 DTO
  - `UserResponseDto`: 사용자 응답 DTO
  - Typia 태그를 사용한 유효성 검사 추가 (이메일 형식 검증)

### 4. 서비스 구현

- Auth 서비스 구현 (`apps/auth/src/auth/auth.service.ts`)
  - 사용자 등록 기능
    - 이메일 중복 확인
    - 비밀번호 해싱 (bcrypt)
    - 사용자 생성 및 JWT 토큰 발행
  - 사용자 로그인 기능
    - 사용자 자격 증명 검증
    - JWT 토큰 발행

### 5. 컨트롤러 구현

- Auth 컨트롤러 구현 (`apps/auth/src/auth/auth.controller.ts`)
  - `POST /api/v1/auth/register`: 사용자 등록 엔드포인트
  - `POST /api/v1/auth/login`: 사용자 로그인 엔드포인트
  - Nestia `TypedRoute`, `TypedBody`를 사용한 타입 안전성 확보
  - Swagger 문서화를 위한 태그 추가 (`@tag public`, `@security bearer`)

### 6. 애플리케이션 설정

- 메인 모듈 설정 (`apps/auth/src/main.module.ts`)
  - MongoDB 연결 설정
  - Auth 모듈 등록
- 메인 엔트리 포인트 설정 (`apps/auth/src/main.ts`)
  - API 경로에 전역 prefix 설정 (`api`)
  - URI 버전닝 설정 (`v1`)

### 7. 테스트 설정

- HTTP 테스트 파일 추가 (`http/auth.http`)
  - 사용자 등록 및 로그인 API 테스트

### 8. 환경 설정 변경

- 운영 환경 설정 변경
  - `local`, `docker`, `stage`, `production` 에서 `dev`, `live`로 변경
  - 패키지 스크립트 명령어 수정

## 주요 파일 구조
/apps /auth /src /auth auth.controller.ts # 인증 컨트롤러
auth.module.ts # 인증 모듈
auth.service.ts # 인증 서비스
main.module.ts # 메인 모듈
main.ts # 엔트리 포인트
/libs /common /auth auth.module.ts # 공통 인증 모듈
jwt.strategy.ts # JWT 전략
jwt.guard.ts # JWT 가드
/config jwt.config.ts # JWT 설정
/constants events.ts # 이벤트 상수
/dto /auth user.dto.ts # 사용자 DTO
/schemas user.schema.ts # 사용자 스키마
/config mongodb.config.ts # MongoDB 설정
bullmq.config.ts # BullMQ 설정
/http auth.http # HTTP 테스트 파일

## 구현 특징

1. **모듈화**: 영속성 데이터 모델과 설정을 libs 디렉토리로 이동하여 재사용성 향상
2. **타입 안전성**: Nestia와 Typia를 활용하여 타입 안전한 API 구현
3. **환경별 설정**: 개발(dev)과 운영(live) 환경에 따른 구성 설정 관리
4. **API 문서화**: Swagger 태그를 활용한 API 문서화 구현
5. **보안**: bcrypt를 사용한 비밀번호 해싱, JWT를 활용한 인증 시스템 구현

## 테스트 방법

1. 서버 실행:
   ```bash
   yarn start:auth  # 개발 환경 (dev)
   yarn start:auth:live  # 운영 환경 (live)
   ```

2. HTTP 테스트:
# 사용자 등록
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",ㅗ
    "role": "user"
  }'

# 사용자 로그인
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

## 향후 계획
사용자 프로필 관리 API 추가
비밀번호 변경/초기화 기능 구현
이메일 인증 기능 구현
토큰 갱신 기능 구현
로그아웃 기능 구현