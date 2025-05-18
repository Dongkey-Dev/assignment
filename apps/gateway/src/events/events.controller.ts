import { Controller } from '@nestjs/common';
import { EventsService } from './events.service';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import {
  CreateEventDto,
  EventResponseDto,
} from '@libs/shared/src/dtos/event.dto';

/**
 * @tag events
 * @security bearer
 */
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * 이벤트 등록
   * @summary 새로운 이벤트를 등록합니다
   */
  @TypedRoute.Post()
  async createEvent(
    @TypedBody() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.createEvent(createEventDto);
  }

  /**
   * 이벤트 조회
   * @summary ID로 이벤트를 조회합니다
   */
  @TypedRoute.Get(':id')
  async getEvent(@TypedParam('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.getEventById(id);
  }

  /**
   * 전체 이벤트 조회
   * @summary 모든 이벤트 목록을 조회합니다
   */
  @TypedRoute.Get()
  async getAllEvents(): Promise<EventResponseDto[]> {
    return this.eventsService.getAllEvents();
  }
}
