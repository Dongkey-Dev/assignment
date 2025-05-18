import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EventsController } from '../src/events/events.controller';
import { EventsService } from '../src/events/events.service';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { JwtStrategy } from '@libs/common/auth/jwt.strategy';
import { User, UserSchema } from '@libs/common/schemas/user.schema';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from '@auth/src/auth/auth.service';
import { CONDITION_TYPES, USER_ACTIONS } from '@libs/common/constants/events';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

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
          { name: Event.name, schema: EventSchema },
          { name: Condition.name, schema: ConditionSchema },
          { name: User.name, schema: UserSchema },
        ]),
      ],
      controllers: [EventsController],
      providers: [EventsService, AuthService, JwtStrategy],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create an event', async () => {
      const mockEvent = {
        id: 'test-id',
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000), // tomorrow
        status: 'active',
        conditionIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'createEvent').mockResolvedValue(mockEvent);

      const createEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        status: 'active',
        conditions: [
          {
            actionType: USER_ACTIONS.LOGIN,
            conditionType: CONDITION_TYPES.CUMULATIVE,
            targetCount: 3,
            targetCountQuery: {
              targetCollection: 'user_actions',
              filter: { type: 'LOGIN', userId: '{{userId}}' },
            },
            status: 'active',
          },
        ],
      };

      expect(await controller.createEvent(createEventDto)).toBe(mockEvent);
    });
  });

  describe('getEvent', () => {
    it('should return an event by id', async () => {
      const mockEvent = {
        id: 'test-id',
        name: 'Test Event',
        description: 'Test Description',
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        status: 'active',
        conditionIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, 'getEventById').mockResolvedValue(mockEvent);

      expect(await controller.getEvent('test-id')).toBe(mockEvent);
    });
  });
});
