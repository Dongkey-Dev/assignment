import { Controller } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import {
  CreateRewardDto,
  RewardResponseDto,
  RequestRewardDto,
  RewardHistoryResponseDto,
} from '@libs/shared/src/dtos/reward.dto';

@Controller('api/v1/rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  /**
   * 보상 등록
   * @tag rewards
   * @security bearer
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
   * @tag rewards
   * @security bearer
   * @summary ID로 보상을 조회합니다
   */
  @TypedRoute.Get(':id')
  async getReward(@TypedParam('id') id: string): Promise<RewardResponseDto> {
    return this.rewardsService.getRewardById(id);
  }

  /**
   * 이벤트별 보상 조회
   * @tag rewards
   * @security bearer
   * @summary 이벤트 ID로 보상 목록을 조회합니다
   */
  @TypedRoute.Get('event/:eventId')
  async getRewardsByEvent(
    @TypedParam('eventId') eventId: string,
  ): Promise<RewardResponseDto[]> {
    return this.rewardsService.getRewardsByEventId(eventId);
  }

  /**
   * 보상 요청
   * @tag rewards
   * @security bearer
   * @summary 조건을 충족한 이벤트의 보상을 요청합니다
   */
  @TypedRoute.Post('request')
  async requestReward(
    @TypedBody() requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    return this.rewardsService.requestReward(requestRewardDto);
  }

  /**
   * 보상 이력 조회
   * @tag rewards
   * @security bearer
   * @summary 사용자의 보상 이력을 조회합니다
   */
  @TypedRoute.Get('history/:userId')
  async getRewardHistory(
    @TypedParam('userId') userId: string,
  ): Promise<RewardHistoryResponseDto[]> {
    return this.rewardsService.getRewardHistory(userId);
  }
}
