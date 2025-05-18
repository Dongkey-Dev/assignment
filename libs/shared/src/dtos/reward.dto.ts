import typia from 'typia';

export interface CreateRewardDto {
  /**
   * Event ID
   */
  eventId: string;

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
    start: Date;

    /**
     * End date
     */
    end: Date;
  };

  /**
   * Reward status
   * @type 'active' | 'inactive'
   */
  status: string;
}

export interface RewardResponseDto {
  /**
   * Reward ID
   */
  id: string;

  /**
   * Event ID
   */
  eventId: string;

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
    start: Date;
    end: Date;
  };

  /**
   * Reward status
   */
  status: string;

  /**
   * Creation date
   */
  createdAt: Date;

  /**
   * Update date
   */
  updatedAt: Date;
}

export interface RequestRewardDto {
  /**
   * Event ID
   */
  eventId: string;

  /**
   * User ID
   */
  userId: string;
}

export interface RewardHistoryQueryDto {
  /**
   * User ID (optional)
   */
  userId?: string;
}

export interface RewardHistoryResponseDto {
  /**
   * Reward history ID
   */
  id: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Event ID
   */
  eventId: string;

  /**
   * Reward ID
   */
  rewardId: string;

  /**
   * Reward information
   */
  reward: RewardResponseDto;

  /**
   * Status
   * @type 'pending' | 'completed' | 'failed'
   */
  status: string;

  /**
   * Creation date
   */
  createdAt: Date;

  /**
   * Update date
   */
  updatedAt: Date;
}
