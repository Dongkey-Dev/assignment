import typia, { tags } from 'typia';

export interface MockActionDto {
  /**
   * User ID
   */
  userId: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;

  /**
   * Action type
   * @type 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND' | 'ACHIEVEMENT'
   */
  action: string;

  /**
   * Action details
   */
  details: {
    /**
     * Action target
     */
    target: {
      /**
       * Target type
       * @type 'USER' | 'QUEST' | 'EVENT' | 'PRODUCT'
       */
      type: string;

      /**
       * Target ID
       */
      id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>;
    };

    /**
     * Additional information
     */
    custom?: Record<string, any>;
  };

  /**
   * Action timestamp
   */
  timestamp?: Date;
}

export const validateMockActionDto = typia.createValidate<MockActionDto>();
