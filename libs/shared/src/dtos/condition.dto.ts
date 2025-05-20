import { TARGET_TYPES } from '@constants/events';
import { tags } from 'typia';

export interface Target {
  type: (typeof TARGET_TYPES)[keyof typeof TARGET_TYPES];
  id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
}

export interface UserAction {
  _id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
  userId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
  action: string;
  details: { target: Target; custom?: Record<string, any> };
  timestamp: Date | (tags.Format<'date-time'> & string);
  createdAt: Date | (tags.Format<'date-time'> & string);
}

export interface Condition {
  _id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
  eventId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
  actionType: string;
  conditionType: 'cumulative' | 'once';
  targetCount: number;
  targetCountQuery: { collection: string; filter: any; sum?: string };
  context: { targetType: string; targetIdField: string };
  period: {
    start: Date | (tags.Format<'date-time'> & string);
    end: Date | (tags.Format<'date-time'> & string);
  };
  createdAt: Date | (tags.Format<'date-time'> & string);
  updatedAt: Date | (tags.Format<'date-time'> & string);
}

export interface CheckConditionDto {
  conditionId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
  userId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
}
