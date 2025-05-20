import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Condition } from '@libs/common/schemas/condition.schema';
import { Event } from '@libs/common/schemas/event.schema';
import { Reward } from '@libs/common/schemas/reward.schema';
import { RewardHistory } from '@libs/common/schemas/reward-history.schema';
import { UserAction } from '@libs/common/schemas/user-action.schema';
import { User } from '@libs/common/schemas/user.schema';
import { Types } from 'mongoose';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Condition.name)
    private readonly conditionModel: Model<Condition>,
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(RewardHistory.name)
    private readonly rewardHistoryModel: Model<RewardHistory>,
    @InjectModel(UserAction.name)
    private readonly userActionModel: Model<UserAction>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private userCheckInterval!: NodeJS.Timeout;
  private userIds: string[] = [];

  async onApplicationBootstrap() {
    this.logger.log(
      'Starting event server seeding on application bootstrap...',
    );
    // Start checking for user data every 5 seconds
    this.userCheckInterval = setInterval(() => this.checkForUserData(), 5000);
  }

  private async checkForUserData() {
    try {
      const users = await this.userModel.find().exec();
      if (users.length > 0) {
        this.logger.log(`Found ${users.length} users in the database`);

        // Store user IDs for use in seeding
        this.userIds = users.map((user) => user._id.toString());

        // Clear the interval once we have user data
        clearInterval(this.userCheckInterval);

        // Proceed with seeding using the real user IDs
        await this.seed();
      } else {
        this.logger.log('No users found yet, waiting...');
      }
    } catch (error) {
      this.logger.error('Error checking for user data:', error);
    }
  }

  async seedEvents(): Promise<Map<string, string>> {
    const count = await this.eventModel.countDocuments();
    if (count > 0) {
      this.logger.log('Events collection is not empty, skipping seeding');
      return new Map();
    }

    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const eventIds = new Map<string, string>();

    const events = [
      {
        _id: new Types.ObjectId(),
        name: '로그인 보상 이벤트',
        description: '3일 연속 로그인하고 특별한 보상을 받아가세요!',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      },
      {
        _id: new Types.ObjectId(),
        name: '친구 초대 이벤트',
        description:
          '친구를 초대하고 풍성한 보상을 받아가세요! 친구와 함께하면 더 즐거워요.',
        startDate: now,
        endDate: nextMonth,
        status: 'active',
        conditionIds: [],
      },
    ];

    const createdEvents = await this.eventModel.insertMany(events);

    createdEvents.forEach((event, index) => {
      eventIds.set(events[index].name, event._id.toString());
    });

    this.logger.log(`Seeded ${events.length} events`);
    return eventIds;
  }

  async seedConditions(
    eventIds: Map<string, string>,
  ): Promise<Map<string, string>> {
    const count = await this.conditionModel.countDocuments();
    if (count > 0) {
      this.logger.log('Conditions collection is not empty, skipping seeding');
      return new Map();
    }

    if (eventIds.size === 0) {
      this.logger.log('No event IDs provided, skipping condition seeding');
      return new Map();
    }

    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const conditionIds = new Map<string, string>();

    const conditions = [
      {
        _id: new Types.ObjectId(),
        eventId: eventIds.get('로그인 보상 이벤트'),
        actionType: 'login',
        conditionType: 'cumulative',
        targetCount: 3,
        status: 'active',
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: { action: 'login' },
        },
        context: {
          targetType: 'User',
          targetIdField: 'userId',
        },
        period: {
          start: now,
          end: nextWeek,
        },
      },
      {
        _id: new Types.ObjectId(),
        eventId: eventIds.get('친구 초대 이벤트'),
        actionType: 'invite_friend',
        conditionType: 'once',
        targetCount: 1,
        status: 'active',
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: { action: 'invite_friend' },
        },
        context: {
          targetType: 'User',
          targetIdField: 'userId',
        },
        period: {
          start: now,
          end: nextMonth,
        },
      },
    ];

    const createdConditions = await this.conditionModel.insertMany(conditions);

    createdConditions.forEach((condition, index) => {
      conditionIds.set(
        `${conditions[index].eventId}-${conditions[index].actionType}`,
        condition._id.toString(),
      );
    });

    // Update events with condition IDs
    await this.eventModel.findByIdAndUpdate(
      eventIds.get('로그인 보상 이벤트'),
      {
        $push: {
          conditionIds: conditionIds.get(
            `${eventIds.get('로그인 보상 이벤트')}-login`,
          ),
        },
      },
    );

    await this.eventModel.findByIdAndUpdate(eventIds.get('친구 초대 이벤트'), {
      $push: {
        conditionIds: conditionIds.get(
          `${eventIds.get('친구 초대 이벤트')}-invite_friend`,
        ),
      },
    });

    this.logger.log(`Seeded ${conditions.length} conditions`);
    return conditionIds;
  }

  async seedRewards(
    eventIds: Map<string, string>,
  ): Promise<Map<string, string>> {
    const count = await this.rewardModel.countDocuments();
    if (count > 0) {
      this.logger.log('Rewards collection is not empty, skipping seeding');
      return new Map();
    }

    if (eventIds.size === 0) {
      this.logger.log('No event IDs provided, skipping reward seeding');
      return new Map();
    }

    const now = new Date();
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const rewardIds = new Map<string, string>();

    const rewards = [
      {
        _id: new Types.ObjectId(),
        eventId: eventIds.get('로그인 보상 이벤트'),
        name: '로그인 포인트',
        description: '3일 연속 로그인 달성! 특별한 포인트를 지급해 드립니다.',
        type: 'POINT',
        value: {
          amount: 100,
          metadata: { currency: 'game_points' },
        },
        period: {
          start: now,
          end: nextWeek,
        },
        status: 'active',
      },
      {
        _id: new Types.ObjectId(),
        eventId: eventIds.get('친구 초대 이벤트'),
        name: '초대 쿠폰',
        description:
          '친구 초대 성공! 20% 할인 쿠폰을 드립니다. 원하는 상품 구매에 사용하세요.',
        type: 'COUPON',
        value: {
          amount: 1,
          metadata: { code: 'FRIEND20', discount: '20%' },
        },
        period: {
          start: now,
          end: nextMonth,
        },
        status: 'active',
      },
      {
        _id: new Types.ObjectId(),
        eventId: eventIds.get('친구 초대 이벤트'),
        name: '프리미엄 아이템',
        description:
          '친구 5명 초대 달성! 희규 레어도의 프리미엄 박스를 지급해 드립니다. 행운을 응원합니다!',
        type: 'ITEM',
        value: {
          amount: 1,
          metadata: { itemId: 'premium_box', rarity: 'legendary' },
        },
        period: {
          start: now,
          end: nextMonth,
        },
        status: 'active',
      },
    ];

    const createdRewards = await this.rewardModel.insertMany(rewards);

    createdRewards.forEach((reward, index) => {
      rewardIds.set(rewards[index].name, reward._id.toString());
    });

    this.logger.log(`Seeded ${rewards.length} rewards`);
    return rewardIds;
  }

  async seedUserActions(): Promise<void> {
    const count = await this.userActionModel.countDocuments();
    if (count > 0) {
      this.logger.log('UserActions collection is not empty, skipping seeding');
      return;
    }

    if (this.userIds.length === 0) {
      this.logger.log('No user IDs available, skipping user action seeding');
      return;
    }

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // Use the first user ID for all actions
    const userId = this.userIds[0];
    const userActions: Array<Partial<UserAction>> = [];

    // Create login actions for the past 3 days
    for (const date of [twoDaysAgo, yesterday, now]) {
      userActions.push({
        userId,
        action: 'login',
        details: {
          target: {
            type: 'User',
            id: userId,
          },
          custom: {
            device: 'mobile',
            platform: 'ios',
          },
        },
        timestamp: date,
      });
    }

    // Create a friend invitation action
    userActions.push({
      userId,
      action: 'invite_friend',
      details: {
        target: {
          type: 'User',
          id: this.userIds.length > 1 ? this.userIds[1] : userId, // Use second user if available, otherwise use the same user
        },
        custom: {
          inviteMethod: 'email',
        },
      },
      timestamp: now,
    });

    type UserActionDocument = {
      userId: string;
      action: string;
      details: {
        target: {
          type: string;
          id: string;
        };
        custom: Record<string, any>;
      };
      timestamp: Date;
    };
    await this.userActionModel.insertMany(userActions as UserActionDocument[]);
    this.logger.log(
      `Seeded ${userActions.length} user actions for user ID: ${userId}`,
    );
  }

  async seedRewardHistories(rewardIds: Map<string, string>): Promise<void> {
    const count = await this.rewardHistoryModel.countDocuments();
    if (count > 0) {
      this.logger.log(
        'RewardHistories collection is not empty, skipping seeding',
      );
      return;
    }

    if (rewardIds.size === 0) {
      this.logger.log(
        'No reward IDs provided, skipping reward history seeding',
      );
      return;
    }

    if (this.userIds.length === 0) {
      this.logger.log('No user IDs available, skipping reward history seeding');
      return;
    }

    // Get the first event from the database
    const firstEvent = await this.eventModel.findOne().exec();
    if (!firstEvent) {
      this.logger.log('No events found, skipping reward history seeding');
      return;
    }

    // Use the first user ID for reward history
    const userId = this.userIds[0];
    const rewardId = rewardIds.get('Login Points');

    if (!rewardId) {
      this.logger.log(
        'Login Points reward not found, skipping reward history seeding',
      );
      return;
    }

    const reward = await this.rewardModel.findById(rewardId);
    if (!reward) {
      this.logger.log(
        `Reward with ID ${rewardId} not found, skipping reward history seeding`,
      );
      return;
    }

    const rewardHistories = [
      {
        userId,
        eventId: firstEvent._id.toString(),
        rewardId,
        reward,
        status: 'completed',
      },
    ];

    await this.rewardHistoryModel.insertMany(rewardHistories as any);
    this.logger.log(
      `Seeded ${rewardHistories.length} reward histories for user ID: ${userId}`,
    );
  }

  async seed(): Promise<void> {
    // Skip seeding if no user IDs are available yet
    if (this.userIds.length === 0) {
      this.logger.log(
        'No user IDs available yet, seeding will be triggered automatically when users are detected',
      );
      return;
    }

    this.logger.log(
      `Starting event server seeding with user IDs: ${this.userIds.join(', ')}`,
    );

    const eventIds = await this.seedEvents();
    const _conditionIds = await this.seedConditions(eventIds);
    const rewardIds = await this.seedRewards(eventIds);

    await this.seedUserActions();
    await this.seedRewardHistories(rewardIds);

    this.logger.log('Event server seeding completed');
  }
}
