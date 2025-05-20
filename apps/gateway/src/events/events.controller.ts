import { Controller } from '@nestjs/common';
import { TypedRoute, TypedBody, TypedParam } from '@nestia/core';
import {
  CreateEventDto,
  EventResponseDto,
} from '@libs/shared/src/dtos/event.dto';
import { tags } from 'typia';

@Controller('api/v1/events')
export class EventsController {
  constructor() {}

  /**
   * 이벤트 등록
   *
   * name: 이벤트 이름
   *
   * conditions.actionType: 'LOGIN' | 'PURCHASE' | 'INVITE_FRIEND' | 'ACHIEVEMENT'
   *
   * conditions.conditionType: 'cumulative' | 'once'
   *
   * conditions.targetCount: 조건을 충족해야 하는 횟수
   *
   * conditions.targetCountQuery: 조건을 충족해야 하는 대상
   *
   * conditions.targetCountQuery.targetCollection: 조건을 충족해야 하는 대상 컬렉션
   *
   * conditions.targetCountQuery.filter: 조건을 충족해야 하는 대상 필터
   *
   * conditions.context: 조건의 컨텍스트
   *
   * conditions.context.targetType: 조건의 타겟 타입 'USER' | 'QUEST' | 'EVENT' | 'PRODUCT'
   *
   * conditions.context.targetIdField: 조건의 타겟 ID 필드
   *
   * conditions.period: 조건의 기간
   *
   * conditions.period.start: 조건의 시작 시간
   *
   * conditions.period.end: 조건의 종료 시간
   *
   * conditions.status: 'active' | 'inactive'
   *
   * @tag events
   * @security bearer
   * @summary 새로운 이벤트를 등록합니다
   */
  @TypedRoute.Post()
  async createEvent(
    @TypedBody() _createEventDto: CreateEventDto,
  ): Promise<EventResponseDto> {
    return {} as unknown as EventResponseDto;
  }

  /**
   * 이벤트 조회
   *
   * @tag events
   * @security bearer
   * @summary ID로 이벤트를 조회합니다
   */
  @TypedRoute.Get(':id')
  async getEvent(
    @TypedParam('id') _id: string & tags.Pattern<'^[a-fA-F0-9]{24}$'>,
  ): Promise<EventResponseDto> {
    return {} as unknown as EventResponseDto;
  }

  /**
   * 전체 이벤트 조회
   * @tag events
   * @security bearer
   * @summary 모든 이벤트 목록을 조회합니다
   */
  @TypedRoute.Get()
  async getAllEvents(): Promise<EventResponseDto[]> {
    return [] as unknown as EventResponseDto[];
  }
}
