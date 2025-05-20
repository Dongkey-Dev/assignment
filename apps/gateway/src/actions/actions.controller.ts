import { Controller } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { TypedRoute, TypedBody } from '@nestia/core';
import { MockActionDto } from '@libs/shared/src/dtos/action.dto';

@Controller('api/v1/actions')
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  /**
   * 유저 행동을 모킹합니다.
   *
   * 이벤트 조건을 달성하기 위한 행동을 생성합니다.
   *
   * action: 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND' | 'ACHIEVEMENT'
   *
   * type: 'USER' | 'QUEST' | 'EVENT' | 'PRODUCT'
   *
   * @tag actions
   * @summary 테스트를 위한 사용자 행동을 모킹합니다
   */
  @TypedRoute.Post('mock')
  async mockAction(
    @TypedBody() mockActionDto: MockActionDto,
  ): Promise<ResponseMockAction> {
    const action = await this.actionsService.createMockAction(mockActionDto);
    return {
      success: true,
      message: 'Action mocked successfully',
      data: action,
    };
  }
}

export type ResponseMockAction = {
  success: boolean;
  message: string;
  data: any;
};
