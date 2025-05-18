import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RewardsController } from '../src/rewards/rewards.controller';
import { RewardsService } from '../src/rewards/rewards.service';
import { Reward, RewardSchema } from '@libs/common/schemas/reward.schema';
import {
  RewardHistory,
  RewardHistorySchema,
} from '@libs/common/schemas/reward-history.schema';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { AuthService } from '@auth/src/auth/auth.service';
import { JwtStrategy } from '@libs/common/auth/jwt.strategy';
import { User, UserSchema } from '@libs/common/schemas/user.schema';
import { ConfigModule } from '@nestjs/config';
import { RewardsConditionCheckerService } from 'apps/event/src/rewards/rewards-condition-checker.service';
import {
  UserAction,
  UserActionSchema,
} from '@libs/common/schemas/user-action.schema';

describe('RewardsController', () => {
  let controller: RewardsController;
  let service: RewardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
        MongooseModule.forRoot(
          process.env.MONGODB_URI ||
            'mongodb://localhost:27017/event-reward-test',
        ),
        MongooseModule.forFeature([
          { name: Reward.name, schema: RewardSchema },
          { name: RewardHistory.name, schema: RewardHistorySchema },
          { name: Event.name, schema: EventSchema },
          { name: Condition.name, schema: ConditionSchema },
          { name: User.name, schema: UserSchema },
          { name: UserAction.name, schema: UserActionSchema },
        ]),
      ],
      controllers: [RewardsController],
      providers: [
        RewardsService,
        AuthService,
        JwtStrategy,
        RewardsConditionCheckerService,
      ],
    }).compile();

    controller = module.get<RewardsController>(RewardsController);
    service = module.get<RewardsService>(RewardsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReward', () => {
    it('should create a reward', async () => {
      const mockReward = {
        id: 'test-reward-id',
        eventId: 'test-event-id',
        name: 'Test Reward',
        description: 'Test Reward Description',
        type: 'POINT',
        value: {
          amount: 100,
          metadata: {},
        },
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createReward').mockResolvedValue(mockReward);

      const createRewardDto = {
        eventId: 'test-event-id',
        name: 'Test Reward',
        description: 'Test Reward Description',
        type: 'POINT',
        value: {
          amount: 100,
          metadata: {},
        },
        status: 'active',
      };

      expect(await controller.createReward(createRewardDto)).toBe(mockReward);
    });
  });

  describe('requestReward', () => {
    it('should request a reward', async () => {
      const mockRewardHistory = {
        id: 'test-history-id',
        userId: 'test-user-id',
        eventId: 'test-event-id',
        rewardId: 'test-reward-id',
        reward: {
          id: 'test-reward-id',
          eventId: 'test-event-id',
          name: 'Test Reward',
          description: 'Test Reward Description',
          type: 'POINT',
          value: {
            amount: 100,
            metadata: {},
          },
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'requestReward').mockResolvedValue(mockRewardHistory);

      const requestRewardDto = {
        eventId: 'test-event-id',
        userId: 'test-user-id',
      };

      expect(await controller.requestReward(requestRewardDto)).toBe(
        mockRewardHistory,
      );
    });
  });

  describe('getRewardHistory', () => {
    it('should return reward history', async () => {
      const mockHistories = [
        {
          id: 'test-history-id',
          userId: 'test-user-id',
          eventId: 'test-event-id',
          rewardId: 'test-reward-id',
          reward: {
            id: 'test-reward-id',
            eventId: 'test-event-id',
            name: 'Test Reward',
            description: 'Test Reward Description',
            type: 'POINT',
            value: {
              amount: 100,
              metadata: {},
            },
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          status: 'completed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(service, 'getRewardHistory').mockResolvedValue(mockHistories);

      expect(
        await controller.getRewardHistory({ userId: 'test-user-id' }),
      ).toBe(mockHistories);
    });
  });
});
