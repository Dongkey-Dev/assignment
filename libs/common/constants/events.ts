/**
 * 사용자 관련 이벤트 상수
 */
export const USER = {
  /**
   * 사용자 생성 이벤트
   */
  CREATED: 'user.created',
} as const;

/**
 * 사용자 액션 상수
 */
export const USER_ACTIONS = {
  PURCHASE: 'purchase',
  INVITE: 'invite',
  LOGIN: 'login',
  INVITE_FRIEND: 'invite_friend',
} as const;

/**
 * 조건 타입 상수
 */
export const CONDITION_TYPES = {
  CUMULATIVE: 'cumulative',
  ONCE: 'once',
} as const;

/**
 * 타겟 타입 상수
 */
export const TARGET_TYPES = {
  USER: 'User',
  PRODUCT: 'Product',
  QUEST: 'Quest',
} as const;
