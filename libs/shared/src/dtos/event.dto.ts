import { CONDITION_TYPES } from '@constants/events';

export interface CreateEventDto {
  /**
   * Event name
   */
  name: string;

  /**
   * Event description
   */
  description: string;

  /**
   * Event start date
   */
  startDate: Date;

  /**
   * Event end date
   */
  endDate: Date;

  /**
   * Event status
   * @type 'active' | 'inactive'
   */
  status: string;

  /**
   * Event conditions list
   */
  conditions: {
    /**
     * Action type
     * @type 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND'
     */
    actionType: string;

    /**
     * Condition type
     */
    conditionType: (typeof CONDITION_TYPES)[keyof typeof CONDITION_TYPES];

    /**
     * Target count
     */
    targetCount: number;

    /**
     * Condition search query
     */
    targetCountQuery: {
      /**
       * Target collection
       */
      targetCollection: string;

      /**
       * Filter
       */
      filter: Record<string, any>;
    };

    /**
     * Condition context
     */
    context?: {
      /**
       * Target type
       */
      targetType: string;

      /**
       * Target ID field
       */
      targetIdField: string;
    };

    /**
     * Condition period
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
     * Condition status
     * @type 'active' | 'inactive'
     */
    status: string;
  }[];
}

export interface EventResponseDto {
  /**
   * Event ID
   */
  id: string;

  /**
   * Event name
   */
  name: string;

  /**
   * Event description
   */
  description: string;

  /**
   * Event start date
   */
  startDate: Date;

  /**
   * Event end date
   */
  endDate: Date;

  /**
   * Event status
   */
  status: string;

  /**
   * Event condition IDs list
   */
  conditionIds: string[];

  /**
   * Creation date
   */
  createdAt: Date;

  /**
   * Update date
   */
  updatedAt: Date;
}
