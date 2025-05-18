import typia from 'typia';

export interface CreateRewardDto {
  /**
   * uc774ubca4ud2b8 ID
   */
  eventId: string;

  /**
   * ubcf4uc0c1 uc774ub984
   */
  name: string;

  /**
   * ubcf4uc0c1 uc124uba85
   */
  description: string;

  /**
   * ubcf4uc0c1 uc720ud615
   * @type 'POINT' | 'ITEM' | 'COUPON'
   */
  type: string;

  /**
   * ubcf4uc0c1 uac00uce58
   */
  value: {
    /**
     * uc218ub7c9 ub610ub294 uac00uce58
     */
    amount: number;

    /**
     * ucd94uac00 uc815ubcf4
     */
    metadata?: Record<string, any>;
  };

  /**
   * ubcf4uc0c1 uae30uac04
   */
  period?: {
    /**
     * uc2dcuc791 uc2dcuac04
     */
    start: Date;

    /**
     * uc885ub8cc uc2dcuac04
     */
    end: Date;
  };

  /**
   * ubcf4uc0c1 uc0c1ud0dc
   * @type 'active' | 'inactive'
   */
  status: string;
}

export interface RewardResponseDto {
  /**
   * ubcf4uc0c1 ID
   */
  id: string;

  /**
   * uc774ubca4ud2b8 ID
   */
  eventId: string;

  /**
   * ubcf4uc0c1 uc774ub984
   */
  name: string;

  /**
   * ubcf4uc0c1 uc124uba85
   */
  description: string;

  /**
   * ubcf4uc0c1 uc720ud615
   */
  type: string;

  /**
   * ubcf4uc0c1 uac00uce58
   */
  value: {
    amount: number;
    metadata?: Record<string, any>;
  };

  /**
   * ubcf4uc0c1 uae30uac04
   */
  period?: {
    start: Date;
    end: Date;
  };

  /**
   * ubcf4uc0c1 uc0c1ud0dc
   */
  status: string;

  /**
   * uc0dduc131 uc2dcuac04
   */
  createdAt: Date;

  /**
   * uc5c5ub370uc774ud2b8 uc2dcuac04
   */
  updatedAt: Date;
}

export interface RequestRewardDto {
  /**
   * uc774ubca4ud2b8 ID
   */
  eventId: string;

  /**
   * uc0acuc6a9uc790 ID
   */
  userId: string;
}

export interface RewardHistoryResponseDto {
  /**
   * ubcf4uc0c1 uc774ub825 ID
   */
  id: string;

  /**
   * uc0acuc6a9uc790 ID
   */
  userId: string;

  /**
   * uc774ubca4ud2b8 ID
   */
  eventId: string;

  /**
   * ubcf4uc0c1 ID
   */
  rewardId: string;

  /**
   * ubcf4uc0c1 uc815ubcf4
   */
  reward: RewardResponseDto;

  /**
   * uc0c1ud0dc
   * @type 'pending' | 'completed' | 'failed'
   */
  status: string;

  /**
   * uc0dduc131 uc2dcuac04
   */
  createdAt: Date;

  /**
   * uc5c5ub370uc774ud2b8 uc2dcuac04
   */
  updatedAt: Date;
}

export const validateCreateRewardDto = typia.createValidate<CreateRewardDto>();
export const validateRequestRewardDto =
  typia.createValidate<RequestRewardDto>();
