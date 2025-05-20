import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EventsController } from './events.controller';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { jwtConfig } from '@libs/common/config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Condition.name, schema: ConditionSchema },
    ]),
    JwtModule.registerAsync(jwtConfig),
  ],
  controllers: [EventsController],
})
export class EventsModule {}
