import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { Reward, RewardSchema } from '@libs/common/schemas/reward.schema';
import {
  RewardHistory,
  RewardHistorySchema,
} from '@libs/common/schemas/reward-history.schema';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { jwtConfig } from '@libs/common/config/jwt.config';
import { EventsModule } from '../events/events.module';
import {
  UserAction,
  UserActionSchema,
} from '@libs/common/schemas/user-action.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: RewardHistory.name, schema: RewardHistorySchema },
      { name: Event.name, schema: EventSchema },
      { name: Condition.name, schema: ConditionSchema },
      { name: UserAction.name, schema: UserActionSchema },
    ]),
    JwtModule.registerAsync(jwtConfig),
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    ConfigModule,
    EventsModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService],
})
export class RewardsModule {}
