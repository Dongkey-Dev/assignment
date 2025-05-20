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
import { EventsService } from '../src/events/events.service';
import { CreateEventDto } from '@libs/shared/src/dtos/event.dto';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let eventModel: Model<Event>;
  let conditionModel: Model<Condition>;
  let eventsService: EventsService;

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
        ]),
      ],
      providers: [EventsService],
    }).compile();

    // Get the models and service
    eventModel = module.get<Model<Event>>(getModelToken(Event.name));
    conditionModel = module.get<Model<Condition>>(
      getModelToken(Condition.name),
    );
    eventsService = module.get<EventsService>(EventsService);
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
  });

  describe('createEvent', () => {
    it('should create an event with conditions successfully', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditions: [
          {
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
          },
        ],
      };

      // Act
      const result = await eventsService.createEvent(createEventDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createEventDto.name);
      expect(result.description).toBe(createEventDto.description);
      expect(result.status).toBe(createEventDto.status);
      expect(result.conditionIds).toHaveLength(1);

      // Verify event was saved to database
      const savedEvent = await eventModel.findById(result.id).exec();
      expect(savedEvent).toBeDefined();
      expect(savedEvent?.name).toBe(createEventDto.name);

      // Verify conditions were saved
      const conditions = await conditionModel
        .find({ eventId: result.id })
        .exec();
      expect(conditions).toHaveLength(1);
      expect(conditions[0].actionType).toBe(
        createEventDto.conditions[0].actionType,
      );
      expect(conditions[0].targetCount).toBe(
        createEventDto.conditions[0].targetCount,
      );
    });
  });

  describe('getEventById', () => {
    it('should return an event when it exists', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const createEventDto: CreateEventDto = {
        name: 'Test Event for GetById',
        description: 'Test Event Description',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditions: [],
      };

      const createdEvent = await eventsService.createEvent(createEventDto);

      // Act
      const result = await eventsService.getEventById(createdEvent.id);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(createdEvent.id);
      expect(result.name).toBe(createEventDto.name);
    });

    it('should throw NotFoundException when event does not exist', async () => {
      // Arrange
      const nonExistentId = '507f1f77bcf86cd799439011'; // Random MongoDB ObjectId

      // Act & Assert
      await expect(eventsService.getEventById(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllEvents', () => {
    it('should return all events', async () => {
      // Arrange
      const now = new Date();
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const createEventDto1: CreateEventDto = {
        name: 'Test Event 1',
        description: 'Test Event Description 1',
        startDate: now,
        endDate: nextWeek,
        status: 'active',
        conditions: [],
      };

      const createEventDto2: CreateEventDto = {
        name: 'Test Event 2',
        description: 'Test Event Description 2',
        startDate: now,
        endDate: nextWeek,
        status: 'inactive',
        conditions: [],
      };

      await eventsService.createEvent(createEventDto1);
      await eventsService.createEvent(createEventDto2);

      // Act
      const results = await eventsService.getAllEvents();

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(2);
      expect(results[0].name).toBe(createEventDto1.name);
      expect(results[1].name).toBe(createEventDto2.name);
    });

    it('should return an empty array when no events exist', async () => {
      // Act
      const results = await eventsService.getAllEvents();

      // Assert
      expect(results).toBeDefined();
      expect(results).toHaveLength(0);
    });
  });
});
