import * as typia from 'typia';

export interface Target {
  type: 'User' | 'Product' & typia.tags.Type<'string'>;
  id: string & typia.tags.Type<'string'>;
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
