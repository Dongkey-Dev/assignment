import typia from 'typia';
import { CONDITION_TYPES } from '../../../common/constants/events';

export interface CreateEventDto {
  /**
   * uc774ubca4ud2b8 uc774ub984
   */
  name: string;

  /**
   * uc774ubca4ud2b8 uc124uba85
   */
  description: string;

  /**
   * uc774ubca4ud2b8 uc2dcuc791 uc2dcuac04
   */
  startDate: Date;

  /**
   * uc774ubca4ud2b8 uc885ub8cc uc2dcuac04
   */
  endDate: Date;

  /**
   * uc774ubca4ud2b8 uc0c1ud0dc
   * @type 'active' | 'inactive'
   */
  status: string;

  /**
   * uc774ubca4ud2b8 uc870uac74 ubaa9ub85d
   */
  conditions: {
    /**
     * ud589ub3d9 uc720ud615
     * @type 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND'
     */
    actionType: string;

    /**
     * uc870uac74 uc720ud615
     */
    conditionType: (typeof CONDITION_TYPES)[keyof typeof CONDITION_TYPES];

    /**
     * ubaa9ud45c uc218uce58
     */
    targetCount: number;

    /**
     * uc870uac74 uac80uc0c9 ucffcub9ac
     */
    targetCountQuery: {
      /**
       * ub300uc0c1 ucf5cub809uc158
       */
      targetCollection: string;

      /**
       * ud544ud130
       */
      filter: Record<string, any>;
    };

    /**
     * uc870uac74 ucee8ud14duc2a4ud2b8
     */
    context?: {
      /**
       * ub300uc0c1 uc720ud615
       */
      targetType: string;

      /**
       * ub300uc0c1 ID ud544ub4dc
       */
      targetIdField: string;
    };

    /**
     * uc870uac74 uae30uac04
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
     * uc870uac74 uc0c1ud0dc
     * @type 'active' | 'inactive'
     */
    status: string;
  }[];
}

export interface EventResponseDto {
  /**
   * uc774ubca4ud2b8 ID
   */
  id: string;

  /**
   * uc774ubca4ud2b8 uc774ub984
   */
  name: string;

  /**
   * uc774ubca4ud2b8 uc124uba85
   */
  description: string;

  /**
   * uc774ubca4ud2b8 uc2dcuc791 uc2dcuac04
   */
  startDate: Date;

  /**
   * uc774ubca4ud2b8 uc885ub8cc uc2dcuac04
   */
  endDate: Date;

  /**
   * uc774ubca4ud2b8 uc0c1ud0dc
   */
  status: string;

  /**
   * uc774ubca4ud2b8 uc870uac74 ID ubaa9ub85d
   */
  conditionIds: string[];

  /**
   * uc0dduc131 uc2dcuac04
   */
  createdAt: Date;

  /**
   * uc5c5ub370uc774ud2b8 uc2dcuac04
   */
  updatedAt: Date;
}

export const validateCreateEventDto = typia.createValidate<CreateEventDto>();
