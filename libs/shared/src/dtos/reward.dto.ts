import typia, { tags } from 'typia';

export interface CreateRewardDto {
  /**
   * Event ID
   */
  eventId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Reward name
   */
  name: string;

  /**
   * Reward description
   */
  description: string;

  /**
   * Reward type
   * @type 'POINT' | 'ITEM' | 'COUPON'
   */
  type: string;

  /**
   * Reward value
   */
  value: {
    /**
     * Amount or value
     */
    amount: number;

    /**
     * Additional information
     */
    metadata?: Record<string, any>;
  };

  /**
   * Reward period
   */
  period?: {
    /**
     * Start date
     */
    start: Date | (tags.Format<'date-time'> & string);

    /**
     * End date
     */
    end: Date | (tags.Format<'date-time'> & string);
  };

  /**
   * Reward status
   * @type 'active' | 'inactive'
   */
  status: 'active' | 'inactive';
}

export interface RewardResponseDto {
  /**
   * Reward ID
   */
  id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Event ID
   */
  eventId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Reward name
   */
  name: string;

  /**
   * Reward description
   */
  description: string;

  /**
   * Reward type
   */
  type: string;

  /**
   * Reward value
   */
  value: {
    amount: number;
    metadata?: Record<string, any>;
  };

  /**
   * Reward period
   */
  period?: {
    start: Date | (tags.Format<'date-time'> & string);
    end: Date | (tags.Format<'date-time'> & string);
  };

  /**
   * Reward status
   */
  status: string;

  /**
   * Creation date
   */
  createdAt: Date | (tags.Format<'date-time'> & string);

  /**
   * Update date
   */
  updatedAt: Date | (tags.Format<'date-time'> & string);
}

export interface RequestRewardDto {
  /**
   * Event ID
   */
  eventId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * User ID
   */
  userId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
}

export interface RewardHistoryQueryDto {
  /**
   * User ID (optional)
   * Using tags.Nullable to make it truly optional (can be undefined)
   */
  userId?: (string & tags.Pattern<'^[a-fA-F0-9]{24}$'>) | undefined;
}

export interface RewardHistoryResponseDto {
  /**
   * Reward history ID
   */
  id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * User ID
   */
  userId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Event ID
   */
  eventId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Reward ID
   */
  rewardId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Reward information
   */
  reward: RewardResponseDto;

  /**
   * Status
   * @type 'pending' | 'completed' | 'failed'
   */
  status: 'pending' | 'completed' | 'failed' | string;

  /**
   * Creation date
   */
  createdAt: Date | (tags.Format<'date-time'> & string);

  /**
   * Update date
   */
  updatedAt: Date | (tags.Format<'date-time'> & string);
}
