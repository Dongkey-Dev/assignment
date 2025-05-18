import { Controller, UseGuards } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import {
  CreateRewardDto,
  RewardResponseDto,
  RequestRewardDto,
  RewardHistoryResponseDto,
} from '@libs/shared/src/dtos/reward.dto';
import { RolesGuard } from '@libs/common/auth/roles.guard';
import { Roles } from '@libs/common/auth/roles.decorator';
import { UserRole } from '@libs/common/schemas/user.schema';

/**
 * @tag rewards
 * @security bearer
 */
@Controller({ path: 'rewards', version: '1' })
@UseGuards(RolesGuard)
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * 보상 등록
   * @summary 새로운 보상을 등록합니다
   */
  @TypedRoute.Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
  async createReward(
    @TypedBody() createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.createReward(createRewardDto);
  }

  /**
   * 보상 조회
   * @summary ID로 보상을 조회합니다
   */
  @TypedRoute.Get(':id')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR)
  async getReward(@TypedParam('id') id: string): Promise<RewardResponseDto> {
    return this.rewardsService.getRewardById(id);
  }

  /**
   * 이벤트별 보상 조회
   * @summary 이벤트 ID로 보상 목록을 조회합니다
   */
  @TypedRoute.Get('event/:eventId')
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR)
  async getRewardsByEvent(
    @TypedParam('eventId') eventId: string,
  ): Promise<RewardResponseDto[]> {
    return this.rewardsService.getRewardsByEventId(eventId);
  }

  /**
   * 보상 요청
   * @summary 조건을 충족한 이벤트의 보상을 요청합니다
   */
  @TypedRoute.Post('request')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async requestReward(
    @TypedBody() requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    return this.rewardsService.requestReward(requestRewardDto);
  }

  /**
   * 보상 이력 조회
   * @summary 사용자의 보상 이력을 조회합니다
   */
  @TypedRoute.Get('history/:userId')
  @Roles(UserRole.AUDITOR, UserRole.ADMIN)
  async getRewardHistory(
    @TypedParam('userId') userId: string,
  ): Promise<RewardHistoryResponseDto[]> {
    return this.rewardsService.getRewardHistory(userId);
  }
}
