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
import { RewardsConditionCheckerService } from 'apps/event/src/rewards/rewards-condition-checker.service';
import { tags } from 'typia';

@Injectable()
export class RewardsService {
  constructor(
    @InjectModel(Reward.name) private rewardModel: Model<Reward>,
    @InjectModel(RewardHistory.name)
    private rewardHistoryModel: Model<RewardHistory>,
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Condition.name) private conditionModel: Model<Condition>,
    private conditionCheckerService: RewardsConditionCheckerService,
  ) {}

  async createReward(
    createRewardDto: CreateRewardDto,
  ): Promise<RewardResponseDto> {
    // Verify that the event exists
    const event = await this.eventModel
      .findById(createRewardDto.eventId)
      .exec();
    if (!event) {
      throw new NotFoundException(
        `Event with ID ${createRewardDto.eventId} not found`,
      );
    }

    // Create the reward
    const reward = new this.rewardModel({
      eventId: createRewardDto.eventId,
      name: createRewardDto.name,
      description: createRewardDto.description,
      type: createRewardDto.type,
      value: createRewardDto.value,
      period: createRewardDto.period || {
        start: event.startDate,
        end: event.endDate,
      },
      status: createRewardDto.status,
    });

    const savedReward = await reward.save();
    return this.mapToRewardResponseDto(savedReward);
  }

  async getRewardById(id: string): Promise<RewardResponseDto> {
    const reward = await this.rewardModel.findById(id).exec();

    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }

    return this.mapToRewardResponseDto(reward);
  }

  async getAllRewards(): Promise<RewardResponseDto[]> {
    const rewards = await this.rewardModel.find().exec();
    return rewards.map((reward) => this.mapToRewardResponseDto(reward));
  }

  async requestReward(
    requestRewardDto: RequestRewardDto,
  ): Promise<RewardHistoryResponseDto> {
    const { eventId, userId } = requestRewardDto;

    // Check if the event exists and is active
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    if (event.status !== 'active') {
      throw new BadRequestException(`Event with ID ${eventId} is not active`);
    }

    // Check if the current date is within the event period
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new BadRequestException(
        `Event with ID ${eventId} is not currently active`,
      );
    }

    // Check if the user has already received a reward for this event
    const existingHistory = await this.rewardHistoryModel
      .findOne({
        eventId,
        userId,
        status: { $in: ['pending', 'completed'] },
      })
      .exec();

    if (existingHistory) {
      throw new ConflictException(
        `User ${userId} has already received a reward for event ${eventId}`,
      );
    }

    // Check if all conditions are met
    const conditions = await this.conditionModel.find({ eventId }).exec();

    for (const condition of conditions) {
      const { isMet } = await this.conditionCheckerService.checkCondition(
        condition._id.toString(),
        userId,
      );

      if (!isMet) {
        throw new BadRequestException(
          `Not all conditions are met for event ${eventId}`,
        );
      }
    }

    // Find an active reward for the event
    const reward = await this.rewardModel
      .findOne({
        eventId,
        status: 'active',
      })
      .exec();

    if (!reward) {
      throw new NotFoundException(
        `No active reward found for event ${eventId}`,
      );
    }

    // Create reward history
    const rewardHistory = new this.rewardHistoryModel({
      userId,
      eventId,
      rewardId: reward._id,
      reward: reward,
      status: 'completed', // Assuming immediate completion for simplicity
    });

    const savedHistory = await rewardHistory.save();
    return this.mapToRewardHistoryResponseDto(savedHistory);
  }

  async getRewardHistory(
    userId?: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>,
  ): Promise<RewardHistoryResponseDto[]> {
    // Build query based on optional userId filter
    const query = userId ? { userId } : {};

    const histories = await this.rewardHistoryModel.find(query).exec();
    return histories.map((history) =>
      this.mapToRewardHistoryResponseDto(history),
    );
  }

  private mapToRewardResponseDto(reward: Reward): RewardResponseDto {
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

  private mapToRewardHistoryResponseDto(
    history: RewardHistory,
  ): RewardHistoryResponseDto {
    return {
      id: history._id.toString(),
      userId: history.userId,
      eventId: history.eventId,
      rewardId: history.rewardId,
      reward: this.mapToRewardResponseDto(history.reward),
      status: history.status,
      createdAt: history.createdAt,
      updatedAt: history.updatedAt,
    };
  }
}
