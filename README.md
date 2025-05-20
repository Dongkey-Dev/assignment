### 0. 프로젝트 구동 방법 및 테스트

1. 루트 디렉터리에서 `docker-compose up -d` 실행 → MongoDB, auth, gateway, event, swagger 서비스 시작
2. API 테스트 방법:

   * `http://localhost:8080/api-docs` → **Swagger UI**
   * `/http/gateway.http` → **REST Client**로 호출 (토큰 필요)
   * `npx ts-node test/e2e-runner.ts` → **시나리오 기반 E2E 테스트**
   * `yarn test` → **핵심 로직에 대한 테스트 실행**
        * `apps/event/test/rewards-condition-checker.spec.ts` → **조건 검증 로직 테스트**

---

### 1. 구현과정 중 발생한 문제와 해결 방법

#### 1.1 게이트웨이 서버에 매번 API를 복제해야 하는 번거로움

* 기존 방식: Auth/Event 서버에서 API 추가 시 **Gateway에도 동일한 컨트롤러 작성 필요**
* 문제점:

  * 작업 중복
  * 라우트 누락 위험
  * 유지보수 비용 증가

#### 해결

* **`routes.ts`에 경로 및 권한 정보 통합**
* \*\*`ProxyMiddleware`\*\*로 경로 프록싱
* 라우트 정보 기반으로 동적 분기 및 권한 검사 자동화
* 현재 게이트웨이 서버의 controller 로직은 swagger 생성 목적을 위함

---

#### 1.2 이벤트 조건 방식 다양 → 유연한 검증 구조 필요

* 조건 종류: `once`, `cumulative`, 향후 `time-based`, `quest` 등
* 문제점:

  * 서비스 복잡도 증가
  * 조건이 늘어날수록 코드 분기 부담

#### 해결

* `Condition` 스키마 일반화 (`type`, `actionType`, `targetCount`, `period`, `context`)
* `RewardsConditionCheckerService`에서 `type`에 따라 동적 분기 처리
* 조건 로직을 모듈화하여 조건 타입 추가 시 영향 최소화

---

### 2. 설계 구조

#### 2.1 서버 구조

```mermaid
graph TD
    A[유저] -->|Swagger Docs| J[Swagger Service:8080]
    J -->|HTTP Requests| B[Gateway Server:3002]
    B -->|Proxy| G[Auth Server:3001]
    B -->|Proxy| H[Event Server:3003]
    G --> I[MongoDB]
    H --> I
```

---

#### 2.2 MongoDB 모델 설계

```mermaid
classDiagram
    class User {
        +_id: ObjectId
        +email: string
        +password: string
        +roles: string[]
        +createdAt: Date
        +updatedAt: Date
    }
    class Event {
        +_id: ObjectId
        +name: string
        +description: string
        +conditionIds: ObjectId[]
        +rewardIds: ObjectId[]
        +createdBy: ObjectId
        +createdAt: Date
    }
    class Condition {
        +_id: ObjectId
        +type: string
        +target: string
        +value: number
        +createdAt: Date
    }
    class Reward {
        +_id: ObjectId
        +type: string
        +value: number|string
        +createdAt: Date
    }
    class Action {
        +_id: ObjectId
        +userId: ObjectId
        +type: string
        +createdAt: Date
    }
    class RewardHistory {
        +_id: ObjectId
        +userId: ObjectId
        +eventId: ObjectId
        +rewardId: ObjectId
        +status: string
        +createdAt: Date
    }

    User "1" --> "N" Action : performs
    User "1" --> "N" RewardHistory : receives
    Event "1" --> "N" Condition : includes
    Event "1" --> "N" Reward : offers
    RewardHistory "N" --> "1" Event : from
    RewardHistory "N" --> "1" Reward : for
```

#### 2.3 관리자 조건 설정 흐름

* 이벤트 및 조건은 `/events` API에서 함께 등록
* 보상은 `/rewards` API로 등록
* 조건의 구조:

  * `type`, `actionType`, `targetCount`, `period`, `context`, `status`

```json
POST /api/v1/events
{
  "name": "Daily Login Event",
  "description": "Login 3 days in a row",
  "startDate": "...",
  "endDate": "...",
  "status": "active",
  "conditions": [
    {
      "actionType": "LOGIN",
      "conditionType": "cumulative",
      "targetCount": 3,
      ...
    }
  ]
}
```

---

### 3. 구현하는 과정에서 어떤 어려움이 있었는지

#### 3.1 동적 라우팅 설계

* **문제**: API가 늘어날수록 Gateway에 중복 작성 필요
* **해결**:

  * `routes.ts`에 경로/역할 정의 → 프록시 대상 추상화
  * `ProxyMiddleware`로 서비스 분기
  * `PATH_PATTERNS` + `PATH_ROLE_MAP`으로 경로 충돌 방지 및 권한 제어

#### 3.2 조건 검증의 유연성

* **문제**: 조건 타입 다양화에 따른 서비스 복잡도 증가
* **해결**:

  * `Condition` 구조를 범용 필드로 통합
  * 검증 로직을 `RewardsConditionCheckerService`에서 `type` 기준 분기
  * 새로운 조건 추가 시 서비스 로직만 수정하면 되도록 설계