import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { Reward, RewardSchema } from '@libs/common/schemas/reward.schema';
import {
  RewardHistory,
  RewardHistorySchema,
} from '@libs/common/schemas/reward-history.schema';
import { RewardsService } from '../src/rewards/rewards.service';
import { RewardsConditionCheckerService } from '../src/rewards/rewards-condition-checker.service';
import {
  CreateRewardDto,
  RequestRewardDto,
} from '@libs/shared/src/dtos/reward.dto';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('RewardsService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let eventModel: Model<Event>;
  let conditionModel: Model<Condition>;
  let rewardModel: Model<Reward>;
  let rewardHistoryModel: Model<RewardHistory>;
  let rewardsService: RewardsService;
  let conditionCheckerService: RewardsConditionCheckerService;

  beforeAll(async () => {
    // Create in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Connect to in-memory database
    mongoConnection = (await connect(uri)).connection;

    // Create the test module
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([
          { name: Event.name, schema: EventSchema },
          { name: Condition.name, schema: ConditionSchema },
          { name: Reward.name, schema: RewardSchema },
          { name: RewardHistory.name, schema: RewardHistorySchema },
        ]),
      ],
      providers: [
        RewardsService,
        {
          provide: RewardsConditionCheckerService,
          useValue: {
            checkCondition: jest.fn(),
          },
        },
      ],
    }).compile();

    // Get the models and service
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
    conditionModel = module.get<Model<Condition>>(
      getModelToken(Condition.name),
    );
    rewardModel = module.get<Model<Reward>>(getModelToken(Reward.name));
    rewardHistoryModel = module.get<Model<RewardHistory>>(
      getModelToken(RewardHistory.name),
    );
    rewardsService = module.get<RewardsService>(RewardsService);
    conditionCheckerService = module.get<RewardsConditionCheckerService>(
      RewardsConditionCheckerService,
    );
  });

  afterAll(async () => {
    try {
      await mongoConnection.close();
      await mongod.stop();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  });

  beforeEach(async () => {
    // Clear the database before each test
    await eventModel.deleteMany({});
    await conditionModel.deleteMany({});
    await rewardModel.deleteMany({});
    await rewardHistoryModel.deleteMany({});

    // Reset mock
    jest.clearAllMocks();
  });

  describe('createReward', () => {
    it('should create a reward successfully when event exists', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Create an event first
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      const createRewardDto: CreateRewardDto = {
        eventId: event._id.toString(),
        name: 'Test Reward',
        description: 'Test Reward Description',
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
      };

      // Act
      const result = await rewardsService.createReward(createRewardDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createRewardDto.name);
      expect(result.description).toBe(createRewardDto.description);
      expect(result.type).toBe(createRewardDto.type);
      expect(result.status).toBe(createRewardDto.status);

      // Verify reward was saved to database
      const savedReward = await rewardModel.findById(result.id).exec();
      expect(savedReward).toBeDefined();
      expect(savedReward?.name).toBe(createRewardDto.name);
      expect(savedReward?.eventId.toString()).toBe(event._id.toString());
    });

    it('should throw NotFoundException when event does not exist', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const createRewardDto: CreateRewardDto = {
        eventId: '507f1f77bcf86cd799439011', // Random MongoDB ObjectId
        name: 'Test Reward',
        description: 'Test Reward Description',
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
      };

      // Act & Assert
      await expect(
        rewardsService.createReward(createRewardDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRewardById', () => {
    it('should return a reward when it exists', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Create an event first
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create a reward
      const reward = new rewardModel({
        eventId: event._id,
        name: 'Test Reward',
        description: 'Test Reward Description',
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
      });
      await reward.save();

      // Act
      const result = await rewardsService.getRewardById(reward._id.toString());

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(reward._id.toString());
      expect(result.name).toBe(reward.name);
    });

    it('should throw NotFoundException when reward does not exist', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011'; // Random MongoDB ObjectId

      // Act & Assert
      await expect(rewardsService.getRewardById(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllRewards', () => {
    it('should return all rewards', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Create an event first
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create rewards
      const reward1 = new rewardModel({
        eventId: event._id,
        name: 'Test Reward 1',
        description: 'Test Reward Description 1',
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
      });
      await reward1.save();

      const reward2 = new rewardModel({
        eventId: event._id,
        name: 'Test Reward 2',
        description: 'Test Reward Description 2',
        type: 'ITEM',
        value: {
          amount: 1,
          metadata: { itemId: 'premium_box' },
        },
        period: {
          start: now,
          end: nextWeek,
        },
        status: 'active',
      });
      await reward2.save();

      // Act
      const results = await rewardsService.getAllRewards();

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe(reward1.name);
      expect(results[1].name).toBe(reward2.name);
    });

    it('should return an empty array when no rewards exist', async () => {
      // Act
      const results = await rewardsService.getAllRewards();

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(0);
    });
  });

  describe('requestReward', () => {
    it('should create a reward history when conditions are met', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const userId = 'user123';

      // Create an event
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create a condition
      const condition = new conditionModel({
        eventId: event._id,
        actionType: 'login',
        conditionType: 'cumulative',
        targetCount: 3,
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
        status: 'active',
      });
      await condition.save();

      // Update event with condition ID
      event.conditionIds = [condition._id];
      await event.save();

      // Create a reward
      const reward = new rewardModel({
        eventId: event._id,
        name: 'Test Reward',
        description: 'Test Reward Description',
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
      });
      await reward.save();

      // Mock condition checker to return condition is met
      (conditionCheckerService.checkCondition as jest.Mock).mockResolvedValue({
        isMet: true,
        currentCount: 3,
        targetCount: 3,
      });

      const requestRewardDto: RequestRewardDto = {
        eventId: event._id.toString(),
        userId,
      };

      // Act
      const result = await rewardsService.requestReward(requestRewardDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.eventId).toBe(event._id.toString());
      expect(result.rewardId).toBe(reward._id.toString());
      expect(result.status).toBe('completed');

      // Verify reward history was saved to database
      const savedHistory = await rewardHistoryModel.findById(result.id).exec();
      expect(savedHistory).toBeDefined();
      expect(savedHistory?.userId).toBe(userId);
      expect(savedHistory?.eventId.toString()).toBe(event._id.toString());
    });

    it('should throw BadRequestException when conditions are not met', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const userId = 'user123';

      // Create an event
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create a condition
      const condition = new conditionModel({
        eventId: event._id,
        actionType: 'login',
        conditionType: 'cumulative',
        targetCount: 3,
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
        status: 'active',
      });
      await condition.save();

      // Update event with condition ID
      event.conditionIds = [condition._id];
      await event.save();

      // Create a reward
      const reward = new rewardModel({
        eventId: event._id,
        name: 'Test Reward',
        description: 'Test Reward Description',
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
      });
      await reward.save();

      // Mock condition checker to return condition is not met
      (conditionCheckerService.checkCondition as jest.Mock).mockResolvedValue({
        isMet: false,
        currentCount: 1,
        targetCount: 3,
      });

      const requestRewardDto: RequestRewardDto = {
        eventId: event._id.toString(),
        userId,
      };

      // Act & Assert
      await expect(
        rewardsService.requestReward(requestRewardDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException when user already received a reward', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const userId = 'user123';

      // Create an event
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create a reward
      const reward = new rewardModel({
        eventId: event._id,
        name: 'Test Reward',
        description: 'Test Reward Description',
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
      });
      await reward.save();

      // Create an existing reward history
      const rewardHistory = new rewardHistoryModel({
        userId,
        eventId: event._id,
        rewardId: reward._id,
        reward,
        status: 'completed',
      });
      await rewardHistory.save();

      const requestRewardDto: RequestRewardDto = {
        eventId: event._id.toString(),
        userId,
      };

      // Act & Assert
      await expect(
        rewardsService.requestReward(requestRewardDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('getRewardHistory', () => {
    it('should return reward history for a specific user', async () => {
      // Arrange
      const now = new Date();
      const userId1 = 'user123';
      const userId2 = 'user456';

      // Create an event
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create a reward
      const reward = new rewardModel({
        eventId: event._id,
        name: 'Test Reward',
        description: 'Test Reward Description',
        type: 'POINT',
        value: {
          amount: 100,
          metadata: { currency: 'game_points' },
        },
        period: {
          start: now,
          end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'active',
      });
      await reward.save();

      // Create reward histories
      const rewardHistory1 = new rewardHistoryModel({
        userId: userId1,
        eventId: event._id,
        rewardId: reward._id,
        reward,
        status: 'completed',
      });
      await rewardHistory1.save();

      const rewardHistory2 = new rewardHistoryModel({
        userId: userId2,
        eventId: event._id,
        rewardId: reward._id,
        reward,
        status: 'completed',
      });
      await rewardHistory2.save();

      // Act
      const results = await rewardsService.getRewardHistory(userId1);

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(1);
      expect(results[0].userId).toBe(userId1);
    });

    it('should return all reward histories when no userId is provided', async () => {
      // Arrange
      const now = new Date();
      const userId1 = 'user123';
      const userId2 = 'user456';

      // Create an event
      const event = new eventModel({
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: 'active',
        conditionIds: [],
      });
      await event.save();

      // Create a reward
      const reward = new rewardModel({
        eventId: event._id,
        name: 'Test Reward',
        description: 'Test Reward Description',
        type: 'POINT',
        value: {
          amount: 100,
          metadata: { currency: 'game_points' },
        },
        period: {
          start: now,
          end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: 'active',
      });
      await reward.save();

      // Create reward histories
      const rewardHistory1 = new rewardHistoryModel({
        userId: userId1,
        eventId: event._id,
        rewardId: reward._id,
        reward,
        status: 'completed',
      });
      await rewardHistory1.save();

      const rewardHistory2 = new rewardHistoryModel({
        userId: userId2,
        eventId: event._id,
        rewardId: reward._id,
        reward,
        status: 'completed',
      });
      await rewardHistory2.save();

      // Act
      const results = await rewardsService.getRewardHistory();

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(2);
    });
  });
});
