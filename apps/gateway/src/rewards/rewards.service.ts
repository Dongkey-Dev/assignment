import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reward } from '@libs/common/schemas/reward.schema';
import { RewardHistory } from '@libs/common/schemas/reward-history.schema';
import { Event } from '@libs/common/schemas/event.schema';
import { Condition } from '@libs/common/schemas/condition.schema';
import {
  CreateRewardDto,
  RewardResponseDto,
  RequestRewardDto,
  RewardHistoryResponseDto,
} from '@libs/shared/src/dtos/reward.dto';
import { ConditionCheckerService } from '@libs/common/services/condition-checker.service';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<Reward>,
    @InjectModel(RewardHistory.name)
    private rewardHistoryModel: Model<RewardHistory>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Condition.name) private conditionModel: Model<Condition>,
    private readonly conditionCheckerService: ConditionCheckerService,
  ) {}

  async createReward(
    createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    // 1. 이벤트 존재 확인
    const event = await this.eventModel.findById(createRewardDto.eventId);
    if (!event) {
      throw new NotFoundException(
        `Event with ID ${createRewardDto.eventId} not found`,
      );
    }

    // 2. 보상 생성
    const newReward = new this.rewardModel({
      ...createRewardDto,
      period: createRewardDto.period || {
        start: event.startDate,
        end: event.endDate,
      },
    });

    const savedReward = await newReward.save();
    return this.mapRewardToResponseDto(savedReward);
  }

  async getRewardById(id: string): Promise<RewardResponseDto> {
    const reward = await this.rewardModel.findById(id);
    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }

    return this.mapRewardToResponseDto(reward);
  }

  async getAllRewards(): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardModel.find().sort({ createdAt: -1 });
    return rewards.map((reward) => this.mapRewardToResponseDto(reward));
  }

  async getRewardsByEventId(eventId: string): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardModel
      .find({ eventId })
      .sort({ createdAt: -1 });
    return rewards.map((reward) => this.mapRewardToResponseDto(reward));
  }

  async requestReward(
    requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    const { eventId, userId } = requestRewardDto;

    // 1. 이벤트 존재 확인
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    // 2. 이벤트 활성화 상태 확인
    if (event.status !== 'active') {
      throw new BadRequestException(`Event with ID ${eventId} is not active`);
    }

    // 3. 이벤트 기간 확인
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new BadRequestException(
        `Event with ID ${eventId} is not in progress`,
      );
    }

    // 4. 이벤트에 연결된 조건 확인
    const conditionIds = event.conditionIds;
    if (!conditionIds.length) {
      throw new BadRequestException(
        `Event with ID ${eventId} has no conditions`,
      );
    }

    // 5. 모든 조건 충족 여부 확인
    const conditionResults = await Promise.all(
      conditionIds.map((conditionId) =>
        this.conditionCheckerService.checkCondition(conditionId, userId),
      ),
    );

    const allConditionsMet = conditionResults.every((result) => result.isMet);
    if (!allConditionsMet) {
      throw new BadRequestException(
        'Not all conditions are met for this event',
      );
    }

    // 6. 이미 보상을 받았는지 확인
    const existingRewardHistory = await this.rewardHistoryModel.findOne({
      userId,
      eventId,
      status: { $in: ['pending', 'completed'] },
    });

    if (existingRewardHistory) {
      throw new ConflictException(
        'Reward has already been claimed for this event',
      );
    }

    // 7. 이벤트에 연결된 보상 확인
    const rewards = await this.rewardModel.find({ eventId, status: 'active' });
    if (!rewards.length) {
      throw new BadRequestException(
        `No active rewards found for event with ID ${eventId}`,
      );
    }

    // 8. 보상 이력 생성
    const rewardHistories: RewardHistory[] = [];

    for (const reward of rewards) {
      const newRewardHistory = new this.rewardHistoryModel({
        userId,
        eventId,
        rewardId: reward._id.toString(),
        reward: this.mapRewardToResponseDto(reward),
        status: 'completed',
      });

      rewardHistories.push(await newRewardHistory.save());
    }

    // 9. 첫 번째 보상 이력 반환
    return this.mapRewardHistoryToResponseDto(rewardHistories[0]);
  }

  async getRewardHistory(userId: string): Promise<RewardHistoryResponseDto[]> {
    const rewardHistories = await this.rewardHistoryModel
      .find({ userId })
      .sort({ createdAt: -1 });

    return rewardHistories.map((history) =>
      this.mapRewardHistoryToResponseDto(history),
    );
  }

  private mapRewardToResponseDto(reward: Reward): RewardResponseDto {
    return {
      id: reward._id.toString(),
      eventId: reward.eventId,
      name: reward.name,
      description: reward.description,
      type: reward.type,
      value: reward.value,
      period: reward.period,
      status: reward.status,
      createdAt: reward.createdAt,
      updatedAt: reward.updatedAt,
    };
  }

  private mapRewardHistoryToResponseDto(
    rewardHistory: RewardHistory,
  ): RewardHistoryResponseDto {
    return {
      id: rewardHistory._id.toString(),
      userId: rewardHistory.userId,
      eventId: rewardHistory.eventId,
      rewardId: rewardHistory.rewardId,
      reward: rewardHistory.reward as any,
      status: rewardHistory.status,
      createdAt: rewardHistory.createdAt,
      updatedAt: rewardHistory.updatedAt,
    };
  }
}
