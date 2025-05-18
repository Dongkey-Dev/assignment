import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
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
import { ConditionCheckerService } from '@libs/common/services/condition-checker.service';
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
    EventsModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService, ConditionCheckerService],
})
export class RewardsModule {}
