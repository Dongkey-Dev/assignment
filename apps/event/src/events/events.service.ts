import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event } from '@libs/common/schemas/event.schema';
import { Condition } from '@libs/common/schemas/condition.schema';
import {
  CreateEventDto,
  EventResponseDto,
} from '@libs/shared/src/dtos/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<Event>,
    @InjectModel(Condition.name) private conditionModel: Model<Condition>,
  ) {}

  async createEvent(createEventDto: CreateEventDto): Promise<EventResponseDto> {
    // Create the event
    const event = new this.eventModel({
      name: createEventDto.name,
      description: createEventDto.description,
      startDate: createEventDto.startDate,
      endDate: createEventDto.endDate,
      status: createEventDto.status,
      conditionIds: [],
    });

    const savedEvent = await event.save();

    // Create conditions for the event
    const conditionPromises = createEventDto.conditions.map(
      async (conditionDto) => {
        const condition = new this.conditionModel({
          eventId: savedEvent._id,
          actionType: conditionDto.actionType,
          conditionType: conditionDto.conditionType,
          targetCount: conditionDto.targetCount,
          targetCountQuery: conditionDto.targetCountQuery,
          context: conditionDto.context,
          period: conditionDto.period || {
            start: createEventDto.startDate,
            end: createEventDto.endDate,
          },
          status: conditionDto.status,
        });

        return condition.save();
      },
    );

    const savedConditions = await Promise.all(conditionPromises);

    // Update event with condition IDs
    const conditionIds = savedConditions.map((condition) => condition._id);
    savedEvent.conditionIds = conditionIds;
    await savedEvent.save();

    return this.mapToEventResponseDto(savedEvent);
  }

  async getEventById(id: string): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(id).exec();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return this.mapToEventResponseDto(event);
  }

  async getAllEvents(): Promise<EventResponseDto[]> {
    const events = await this.eventModel.find().exec();
    return events.map((event) => this.mapToEventResponseDto(event));
  }

  private mapToEventResponseDto(event: Event): EventResponseDto {
    return {
      id: event._id.toString(),
      name: event.name,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      status: event.status,
      conditionIds: event.conditionIds,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
