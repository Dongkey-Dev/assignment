import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam, TypedQuery } from '@nestia/core';
import { RewardsService } from './rewards.service';
import {
  CreateRewardDto,
  RewardResponseDto,
  RequestRewardDto,
  RewardHistoryResponseDto,
  RewardHistoryQueryDto,
} from '@libs/shared/src/dtos/reward.dto';

/**
 * @tag rewards
 */
@Controller({ path: 'rewards', version: '1' })
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * Register reward
   * @summary Register a new reward
   */
  @TypedRoute.Post()
  async createReward(
    @TypedBody() createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.createReward(createRewardDto);
  }

  /**
   * Get reward
   * @summary Get information about a specific reward
   */
  @TypedRoute.Get(':id')
  async getReward(@TypedParam('id') id: string): Promise<RewardResponseDto> {
    return this.rewardsService.getRewardById(id);
  }

  /**
   * Get all rewards
   * @summary Get a list of all rewards
   */
  @TypedRoute.Get()
  async getAllRewards(): Promise<RewardResponseDto[]> {
    return this.rewardsService.getAllRewards();
  }

  /**
   * Request reward
   * @summary Request an event reward
   */
  @TypedRoute.Post('request')
  async requestReward(
    @TypedBody() requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    return this.rewardsService.requestReward(requestRewardDto);
  }

  /**
   * Get reward history
   * @summary Get reward history
   */
  @TypedRoute.Get('history')
  async getRewardHistory(
    @TypedQuery() query: RewardHistoryQueryDto,
  ): Promise<RewardHistoryResponseDto[]> {
    return this.rewardsService.getRewardHistory(query.userId);
  }
}
