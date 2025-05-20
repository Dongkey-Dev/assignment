import { CONDITION_TYPES } from '@constants/events';
import { tags } from 'typia';

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
  startDate: Date | (tags.Format<'date-time'> & string);

  /**
   * Event end date
   */
  endDate: Date | (tags.Format<'date-time'> & string);

  /**
   * Event status
   * @type 'active' | 'inactive'
   */
  status: 'active' | 'inactive';

  /**
   * Event conditions list
   */
  conditions: {
    /**
     * Action type
     * @type 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND' | 'ACHIEVEMENT'
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
      start: Date | (tags.Format<'date-time'> & string);

      /**
       * End date
       */
      end: Date | (tags.Format<'date-time'> & string);
    };

    /**
     * Condition status
     * @type 'active' | 'inactive'
     */
    status: 'active' | 'inactive';
  }[];
}

export interface EventResponseDto {
  /**
   * Event ID
   */
  id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

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
  startDate: Date | (tags.Format<'date-time'> & string);

  /**
   * Event end date
   */
  endDate: Date | (tags.Format<'date-time'> & string);

  /**
   * Event status
   */
  status: 'active' | 'inactive';

  /**
   * Event condition IDs list
   */
  conditionIds: (string & tags.Pattern<'^[a-fA-F0-9]{24}$'>)[];

  /**
   * Creation date
   */
  createdAt: Date | (tags.Format<'date-time'> & string);

  /**
   * Update date
   */
  updatedAt: Date | (tags.Format<'date-time'> & string);
}
