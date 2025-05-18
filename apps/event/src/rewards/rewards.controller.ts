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
   * 보상 등록
   * @summary 새로운 보상을 등록합니다
   */
  @TypedRoute.Post()
  async createReward(
    @TypedBody() createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.createReward(createRewardDto);
  }

  /**
   * 보상 조회
   * @summary 특정 보상 정보를 조회합니다
   */
  @TypedRoute.Get(':id')
  async getReward(@TypedParam('id') id: string): Promise<RewardResponseDto> {
    return this.rewardsService.getRewardById(id);
  }

  /**
   * 보상 목록 조회
   * @summary 모든 보상 목록을 조회합니다
   */
  @TypedRoute.Get()
  async getAllRewards(): Promise<RewardResponseDto[]> {
    return this.rewardsService.getAllRewards();
  }

  /**
   * 보상 요청
   * @summary 이벤트 보상을 요청합니다
   */
  @TypedRoute.Post('request')
  async requestReward(
    @TypedBody() requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    return this.rewardsService.requestReward(requestRewardDto);
  }

  /**
   * 보상 이력 조회
   * @summary 보상 이력을 조회합니다
   */
  @TypedRoute.Get('history')
  async getRewardHistory(
    @TypedQuery() query: RewardHistoryQueryDto,
  ): Promise<RewardHistoryResponseDto[]> {
    return this.rewardsService.getRewardHistory(query.userId);
  }
}
