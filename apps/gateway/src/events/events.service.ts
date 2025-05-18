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
    // 1. 이벤트 생성
    const newEvent = new this.eventModel({
      name: createEventDto.name,
      description: createEventDto.description,
      startDate: createEventDto.startDate,
      endDate: createEventDto.endDate,
      status: createEventDto.status,
      conditionIds: [],
    });

    const savedEvent = await newEvent.save();
    const eventId = savedEvent._id;

    // 2. 조건 생성 및 이벤트에 연결
    const conditionIds: string[] = [];

    for (const conditionData of createEventDto.conditions) {
      const newCondition = new this.conditionModel({
        eventId,
        actionType: conditionData.actionType,
        conditionType: conditionData.conditionType,
        targetCount: conditionData.targetCount,
        targetCountQuery: conditionData.targetCountQuery,
        context: conditionData.context,
        period: conditionData.period || {
          start: createEventDto.startDate,
          end: createEventDto.endDate,
        },
        status: conditionData.status,
      });

      const savedCondition = await newCondition.save();
      conditionIds.push(savedCondition._id);
    }

    // 3. 이벤트에 조건 ID 업데이트
    savedEvent.conditionIds = conditionIds;
    await savedEvent.save();

    return this.mapEventToResponseDto(savedEvent);
  }

  async getEventById(id: string): Promise<EventResponseDto> {
    const event = await this.eventModel.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return this.mapEventToResponseDto(event);
  }

  async getAllEvents(): Promise<EventResponseDto[]> {
    const events = await this.eventModel.find().sort({ createdAt: -1 });
    return events.map((event) => this.mapEventToResponseDto(event));
  }

  private mapEventToResponseDto(event: Event): EventResponseDto {
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
