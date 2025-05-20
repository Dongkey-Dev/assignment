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
import { tags } from 'typia';

/**
 * @tag rewards
 */
@Controller('api/v1/rewards')
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
   * 전체 보상 조회
   * @summary 모든 보상 목록을 조회합니다
   */
  @TypedRoute.Get()
  async getAllRewards(): Promise<RewardResponseDto[]> {
    return this.rewardsService.getAllRewards();
  }

  /**
   * 전체 보상 이력 조회
   * @summary 보상 이력을 조회합니다.
   */
  @TypedRoute.Get('histories')
  async getAllRewardHistory(): Promise<RewardHistoryResponseDto[]> {
    return this.rewardsService.getRewardHistory();
  }

  /**
   * 현재 사용자의 보상 이력 조회
   * @summary 현재 로그인한 사용자의 보상 이력을 조회합니다
   */
  @TypedRoute.Get('histories/me')
  async getMyRewardHistory(
    @TypedQuery() query: RewardHistoryQueryDto = {},
  ): Promise<RewardHistoryResponseDto[]> {
    // userId는 인증 미들웨어에서 추출된 값을 사용해야 하지만
    // 여기서는 query에서 받은 값을 사용합니다
    if (!query.userId) {
      return [];
    }
    return this.rewardsService.getRewardHistory(query.userId);
  }

  /**
   * 보상 요청
   * @summary 조건을 충족한 이벤트의 보상을 요청합니다
   */
  @TypedRoute.Post('request')
  async requestReward(
    @TypedBody() requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    return this.rewardsService.requestReward(requestRewardDto);
  }

  /**
   * 보상 조회
   * @summary ID로 보상을 조회합니다
   */
  @TypedRoute.Get(':id')
  async getReward(
    @TypedParam('id') id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>,
  ): Promise<RewardResponseDto> {
    return this.rewardsService.getRewardById(id);
  }
}
