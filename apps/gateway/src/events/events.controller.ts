import { Controller, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import {
  CreateEventDto,
  EventResponseDto,
} from '@libs/shared/src/dtos/event.dto';
import { RolesGuard } from '@libs/common/auth/roles.guard';
import { Roles } from '@libs/common/auth/roles.decorator';
import { UserRole } from '@libs/common/schemas/user.schema';

/**
 * @tag events
 * @security bearer
 */
@Controller({ path: 'events', version: '1' })
@UseGuards(RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * 이벤트 등록
   * @summary 새로운 이벤트를 등록합니다
   */
  @TypedRoute.Post()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN)
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
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR, UserRole.USER)
  async getEvent(@TypedParam('id') id: string): Promise<EventResponseDto> {
    return this.eventsService.getEventById(id);
  }

  /**
   * 전체 이벤트 조회
   * @summary 모든 이벤트 목록을 조회합니다
   */
  @TypedRoute.Get()
  @Roles(UserRole.OPERATOR, UserRole.ADMIN, UserRole.AUDITOR, UserRole.USER)
  async getAllEvents(): Promise<EventResponseDto[]> {
    return this.eventsService.getAllEvents();
  }
}
