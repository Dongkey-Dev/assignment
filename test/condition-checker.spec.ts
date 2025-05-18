import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect, Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConditionCheckerService } from '../libs/common/services/condition-checker.service';
import {
  Condition,
  ConditionSchema,
} from '../libs/common/schemas/condition.schema';
import {
  UserAction,
  UserActionSchema,
} from '../libs/common/schemas/user-action.schema';
import { USER_ACTIONS, CONDITION_TYPES } from '../libs/common/constants/events';

describe('ConditionChecker PoC Test', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let conditionModel: Model<Condition>;
  let userActionModel: Model<UserAction>;
  let conditionCheckerService: ConditionCheckerService;

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
          { name: Condition.name, schema: ConditionSchema },
          { name: UserAction.name, schema: UserActionSchema },
        ]),
      ],
      providers: [ConditionCheckerService],
    }).compile();

    // Get the models and service
    conditionModel = module.get<Model<Condition>>(
      getModelToken(Condition.name),
    );
    userActionModel = module.get<Model<UserAction>>(
      getModelToken(UserAction.name),
    );
    conditionCheckerService = module.get<ConditionCheckerService>(
      ConditionCheckerService,
    );
  });

  afterAll(async () => {
    try {
      // Close the MongoDB connection
      await mongoConnection.close(true); // Force close
      // Stop the MongoDB server
      await mongod.stop();

      // Add a small delay to ensure all connections are closed
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  });

  beforeEach(async () => {
    // Clear the database before each test
    await conditionModel.deleteMany({});
    await userActionModel.deleteMany({});
  });

  describe('Purchase Count Condition', () => {
    const userId = 'user_123';
    const productId = 'product_123';
    const eventId = 'event_125';
    let conditionId: string;

    beforeEach(async () => {
      // Create a condition: Purchase product_123 at least 3 times
      const condition = await conditionModel.create({
        eventId,
        actionType: USER_ACTIONS.PURCHASE,
        conditionType: CONDITION_TYPES.CUMULATIVE,
        targetCount: 3,
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: {
            action: USER_ACTIONS.PURCHASE,
            'details.target.type': 'Product',
            'details.target.id': productId,
            userId: '{{userId}}',
            timestamp: {
              $gte: '{{startDate}}',
              $lte: '{{endDate}}',
            },
          },
        },
        context: {
          targetType: 'Product',
          targetIdField: 'details.target.id',
        },
        period: {
          start: new Date('2025-05-01T00:00:00Z'),
          end: new Date('2025-05-31T23:59:59Z'),
        },
        status: 'active',
      });

      conditionId = condition._id.toString();
    });

    it('should return false when no purchases are made', async () => {
      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(0);
    });

    it('should return false when fewer than 3 purchases are made', async () => {
      // Create 2 purchase actions
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 100,
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 150,
            },
          },
          timestamp: new Date('2025-05-05T11:00:00Z'),
          createdAt: new Date('2025-05-05T11:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(2);
    });

    it('should return true when 3 or more purchases are made', async () => {
      // Create 3 purchase actions
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 100,
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 150,
            },
          },
          timestamp: new Date('2025-05-05T11:00:00Z'),
          createdAt: new Date('2025-05-05T11:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 200,
            },
          },
          timestamp: new Date('2025-05-06T12:00:00Z'),
          createdAt: new Date('2025-05-06T12:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(true);
      expect(result.currentCount).toBe(3);
    });

    it('should not count purchases of different products', async () => {
      // Create 2 purchase actions for the target product and 1 for a different product
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 100,
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 150,
            },
          },
          timestamp: new Date('2025-05-05T11:00:00Z'),
          createdAt: new Date('2025-05-05T11:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: 'different_product',
            },
            custom: {
              amount: 200,
            },
          },
          timestamp: new Date('2025-05-06T12:00:00Z'),
          createdAt: new Date('2025-05-06T12:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(2);
    });
  });

  describe('Purchase Amount Condition', () => {
    const userId = 'user_123';
    const productId = 'product_123';
    const eventId = 'event_126';
    let conditionId: string;

    beforeEach(async () => {
      // Create a condition: Purchase product_123 with a total amount of at least 500
      const condition = await conditionModel.create({
        eventId,
        actionType: USER_ACTIONS.PURCHASE,
        conditionType: CONDITION_TYPES.CUMULATIVE,
        targetCount: 500,
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: {
            action: USER_ACTIONS.PURCHASE,
            'details.target.type': 'Product',
            'details.target.id': productId,
            userId: '{{userId}}',
            timestamp: {
              $gte: '{{startDate}}',
              $lte: '{{endDate}}',
            },
          },
          sum: 'details.custom.amount',
        },
        context: {
          targetType: 'Product',
          targetIdField: 'details.target.id',
        },
        period: {
          start: new Date('2025-05-01T00:00:00Z'),
          end: new Date('2025-05-31T23:59:59Z'),
        },
        status: 'active',
      });

      conditionId = condition._id.toString();
    });

    it('should return true when the total purchase amount is at least 500', async () => {
      // Create purchase actions with a total amount of 550
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 200,
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 150,
            },
          },
          timestamp: new Date('2025-05-05T11:00:00Z'),
          createdAt: new Date('2025-05-05T11:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 200,
            },
          },
          timestamp: new Date('2025-05-06T12:00:00Z'),
          createdAt: new Date('2025-05-06T12:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(true);
      expect(result.currentCount).toBe(550);
    });

    it('should return false when the total purchase amount is less than 500', async () => {
      // Create purchase actions with a total amount of 350
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 200,
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.PURCHASE,
          details: {
            target: {
              type: 'Product',
              id: productId,
            },
            custom: {
              amount: 150,
            },
          },
          timestamp: new Date('2025-05-05T11:00:00Z'),
          createdAt: new Date('2025-05-05T11:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(350);
    });
  });

  describe('Login Streak Condition', () => {
    const userId = 'user_123';
    const eventId = 'event_127';
    let conditionId: string;

    beforeEach(async () => {
      // Create a condition: Login for 3 consecutive days
      const condition = await conditionModel.create({
        eventId,
        actionType: USER_ACTIONS.LOGIN,
        conditionType: CONDITION_TYPES.CUMULATIVE,
        targetCount: 3,
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: {
            action: USER_ACTIONS.LOGIN,
            userId: '{{userId}}',
            timestamp: {
              $gte: '{{startDate}}',
              $lte: '{{endDate}}',
            },
          },
        },
        context: {
          targetType: 'User',
          targetIdField: 'details.target.id',
        },
        period: {
          start: new Date('2025-05-01T00:00:00Z'),
          end: new Date('2025-05-31T23:59:59Z'),
        },
        status: 'active',
      });

      conditionId = condition._id.toString();
    });

    it('should return true when user logs in for 3 consecutive days', async () => {
      // Create 3 consecutive login actions
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-01T10:00:00Z'),
          createdAt: new Date('2025-05-01T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-02T10:00:00Z'),
          createdAt: new Date('2025-05-02T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-03T10:00:00Z'),
          createdAt: new Date('2025-05-03T10:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(true);
      expect(result.currentCount).toBe(3);
    });

    it('should return false when user logs in for fewer than 3 days', async () => {
      // Create 2 login actions
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-01T10:00:00Z'),
          createdAt: new Date('2025-05-01T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-02T10:00:00Z'),
          createdAt: new Date('2025-05-02T10:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(2);
    });

    it('should count non-consecutive login days correctly', async () => {
      // Create 3 non-consecutive login actions
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-01T10:00:00Z'),
          createdAt: new Date('2025-05-01T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-03T10:00:00Z'), // Skipped day 2
          createdAt: new Date('2025-05-03T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.LOGIN,
          details: {
            target: {
              type: 'User',
              id: userId,
            },
          },
          timestamp: new Date('2025-05-05T10:00:00Z'), // Skipped day 4
          createdAt: new Date('2025-05-05T10:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result - should still be met since we're just counting total logins
      expect(result.isMet).toBe(true);
      expect(result.currentCount).toBe(3);
    });
  });

  describe('Friend Invitation Condition', () => {
    const userId = 'user_123';
    const eventId = 'event_128';
    let conditionId: string;

    beforeEach(async () => {
      // Create a condition: Invite at least 2 friends
      const condition = await conditionModel.create({
        eventId,
        actionType: USER_ACTIONS.INVITE_FRIEND,
        conditionType: CONDITION_TYPES.CUMULATIVE,
        targetCount: 2,
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: {
            action: USER_ACTIONS.INVITE_FRIEND,
            userId: '{{userId}}',
            timestamp: {
              $gte: '{{startDate}}',
              $lte: '{{endDate}}',
            },
          },
        },
        context: {
          targetType: 'User',
          targetIdField: 'details.target.id',
        },
        period: {
          start: new Date('2025-05-01T00:00:00Z'),
          end: new Date('2025-05-31T23:59:59Z'),
        },
        status: 'active',
      });

      conditionId = (condition as any)._id.toString();
    });

    it('should return true when user invites at least 2 friends', async () => {
      // Create 2 friend invitation actions
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.INVITE_FRIEND,
          details: {
            target: {
              type: 'User',
              id: 'friend_1',
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
        {
          userId,
          action: USER_ACTIONS.INVITE_FRIEND,
          details: {
            target: {
              type: 'User',
              id: 'friend_2',
            },
          },
          timestamp: new Date('2025-05-05T11:00:00Z'),
          createdAt: new Date('2025-05-05T11:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(true);
      expect(result.currentCount).toBe(2);
    });

    it('should return false when user invites fewer than 2 friends', async () => {
      // Create 1 friend invitation action
      await userActionModel.create([
        {
          userId,
          action: USER_ACTIONS.INVITE_FRIEND,
          details: {
            target: {
              type: 'User',
              id: 'friend_1',
            },
          },
          timestamp: new Date('2025-05-04T10:00:00Z'),
          createdAt: new Date('2025-05-04T10:00:00Z'),
        },
      ]);

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(1);
    });
  });

  describe('Inactive Condition', () => {
    const userId = 'user_123';
    const eventId = 'event_129';
    let conditionId: string;

    beforeEach(async () => {
      // Create an inactive condition
      const condition = await conditionModel.create({
        eventId,
        actionType: USER_ACTIONS.LOGIN,
        conditionType: CONDITION_TYPES.CUMULATIVE,
        targetCount: 1,
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: {
            action: USER_ACTIONS.LOGIN,
            userId: '{{userId}}',
            timestamp: {
              $gte: '{{startDate}}',
              $lte: '{{endDate}}',
            },
          },
        },
        context: {
          targetType: 'User',
          targetIdField: 'userId',
        },
        period: {
          start: new Date('2025-05-01T00:00:00Z'),
          end: new Date('2025-05-31T23:59:59Z'),
        },
        status: 'inactive', // Set status to inactive
      });

      conditionId = condition._id.toString();
    });

    it('should return false for inactive conditions regardless of actions', async () => {
      // Create a login action that would normally satisfy the condition
      await userActionModel.create({
        userId,
        action: USER_ACTIONS.LOGIN,
        details: {
          target: {
            type: 'User',
            id: userId,
          },
        },
        timestamp: new Date('2025-05-01T10:00:00Z'),
        createdAt: new Date('2025-05-01T10:00:00Z'),
      });

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result - should be false because condition is inactive
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(0);
    });
  });

  describe('Out of Period Condition', () => {
    const userId = 'user_123';
    const eventId = 'event_130';
    let conditionId: string;

    beforeEach(async () => {
      // Create a condition with a period in the past
      const condition = await conditionModel.create({
        eventId,
        actionType: USER_ACTIONS.LOGIN,
        conditionType: CONDITION_TYPES.CUMULATIVE,
        targetCount: 1,
        targetCountQuery: {
          targetCollection: 'user_actions',
          filter: {
            action: USER_ACTIONS.LOGIN,
            userId: '{{userId}}',
            timestamp: {
              $gte: '{{startDate}}',
              $lte: '{{endDate}}',
            },
          },
        },
        context: {
          targetType: 'User',
          targetIdField: 'userId',
        },
        period: {
          start: new Date('2024-01-01T00:00:00Z'), // Past period
          end: new Date('2024-01-31T23:59:59Z'),
        },
        status: 'active',
      });

      conditionId = condition._id.toString();
    });

    it('should return false for conditions with periods in the past', async () => {
      // Create a login action that would normally satisfy the condition
      await userActionModel.create({
        userId,
        action: USER_ACTIONS.LOGIN,
        details: {
          target: {
            type: 'User',
            id: userId,
          },
        },
        timestamp: new Date('2024-01-15T10:00:00Z'), // Within the period
        createdAt: new Date('2024-01-15T10:00:00Z'),
      });

      // Check the condition
      const result = await conditionCheckerService.checkCondition(
        conditionId,
        userId,
      );

      // Verify the result - should be false because current date is outside period
      expect(result.isMet).toBe(false);
      expect(result.currentCount).toBe(0);
    });
  });
});
