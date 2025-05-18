import typia from 'typia';

export interface MockActionDto {
  /**
   * User ID
   * @format uuid
   */
  userId: string;

  /**
   * Action type
   * @type 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND'
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
       * @type 'User' | 'Product'
       */
      type: string;

      /**
       * Target ID
       * @format uuid
       */
      id: string;
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
