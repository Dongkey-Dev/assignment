import typia from 'typia';

export interface MockActionDto {
  /**
   * uc0acuc6a9uc790 ID
   * @format uuid
   */
  userId: string;

  /**
   * ud589ub3d9 uc720ud615
   * @type 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND'
   */
  action: string;

  /**
   * ud589ub3d9 uc138ubd80 uc815ubcf4
   */
  details: {
    /**
     * ud589ub3d9 ub300uc0c1
     */
    target: {
      /**
       * ub300uc0c1 uc720ud615
       * @type 'User' | 'Product'
       */
      type: string;

      /**
       * ub300uc0c1 ID
       * @format uuid
       */
      id: string;
    };

    /**
     * ucd94uac00 uc815ubcf4
     */
    custom?: Record<string, any>;
  };

  /**
   * ud589ub3d9 uc2dcuac04
   */
  timestamp?: Date;
}

export const validateMockActionDto = typia.createValidate<MockActionDto>();
