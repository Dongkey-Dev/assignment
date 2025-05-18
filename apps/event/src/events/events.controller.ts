import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import { EventsService } from './events.service';
import {
  CreateEventDto,
  EventResponseDto,
} from '@libs/shared/src/dtos/event.dto';

/**
 * @tag events
 */
@Controller({ path: 'events', version: '1' })
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * Register event
   * @summary Register a new event
   */
  @TypedRoute.Post()
  async createEvent(
    @TypedBody() createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return this.eventsService.createEvent(createEventDto);
  }

  /**
   * Get event
   * @summary Get information about a specific event
   */
  @TypedRoute.Get(':id')
  async getEvent(@TypedParam('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.getEventById(id);
  }

  /**
   * Get all events
   * @summary Get a list of all events
   */
  @TypedRoute.Get()
  async getAllEvents(): Promise<EventResponseDto[]> {
    return this.eventsService.getAllEvents();
  }
}
