import { TARGET_TYPES } from '@libs/common/constants/events';

export interface Target {
  type: (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES];
  id: string;
}

export interface UserAction {
  _id: string;
  userId: string;
  action: string;
  details: { target: Target; custom?: Record<string, any> };
  timestamp: Date;
  createdAt: Date;
}

export interface Condition {
  _id: string;
  eventId: string;
  actionType: string;
  conditionType: 'cumulative' | 'once';
  targetCount: number;
  targetCountQuery: { collection: string; filter: any; sum?: string };
  context: { targetType: string; targetIdField: string };
  period: { start: Date; end: Date };
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckConditionDto {
  conditionId: string;
  userId: string;
}
