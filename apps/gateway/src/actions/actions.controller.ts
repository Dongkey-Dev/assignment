import { Controller } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { TypedRoute, TypedBody } from '@nestia/core';
import { MockActionDto } from '@libs/shared/src/dtos/action.dto';

/**
 * @tag actions
 * @security bearer
 */
@Controller({ path: 'actions', version: '1' })
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  /**
   * 유저 행동 모킹
   * @summary 테스트를 위한 사용자 행동을 모킹합니다
   */
  @TypedRoute.Post('mock')
  async mockAction(
    @TypedBody() mockActionDto: MockActionDto,
  ): Promise<{ success: boolean; message: string; data: any }> {
    const action = await this.actionsService.createMockAction(mockActionDto);
    return {
      success: true,
      message: 'Action mocked successfully',
      data: action,
    };
  }
}
