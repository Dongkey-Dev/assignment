import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Reward, RewardSchema } from '@libs/common/schemas/reward.schema';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import { AuthModule } from '@libs/common/auth/auth.module';
import { EventsModule } from '../events/events.module';
import { ConditionModule } from '@libs/common/condition/condition.module';
import {
  RewardHistory,
  RewardHistorySchema,
} from '@libs/common/schemas/reward-history.schema';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { RewardsController } from './rewards.controller';
import { RewardsService } from './rewards.service';
import { RewardsConditionCheckerService } from './rewards-condition-checker.service';
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
    AuthModule,
    EventsModule,
    ConditionModule,
  ],
  controllers: [RewardsController],
  providers: [RewardsService, RewardsConditionCheckerService],
})
export class RewardsModule {}
