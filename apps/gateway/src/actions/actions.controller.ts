import { Controller, UseGuards } from '@nestjs/common';
import { ActionsService } from './actions.service';
import { TypedRoute, TypedBody } from '@nestia/core';
import { MockActionDto } from '@libs/shared/src/dtos/action.dto';
import { RolesGuard } from '@libs/common/auth/roles.guard';
import { Roles } from '@libs/common/auth/roles.decorator';
import { UserRole } from '@libs/common/schemas/user.schema';

/**
 * @tag actions
 * @security bearer
 */
@Controller({ path: 'actions', version: '1' })
@UseGuards(RolesGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  /**
   * 유저 행동 모킹
   * @summary 테스트를 위한 사용자 행동을 모킹합니다
   */
  @TypedRoute.Post('mock')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR, UserRole.USER)
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
