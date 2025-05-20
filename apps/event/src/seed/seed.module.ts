import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Condition,
  ConditionSchema,
} from '@libs/common/schemas/condition.schema';
import { Event, EventSchema } from '@libs/common/schemas/event.schema';
import { Reward, RewardSchema } from '@libs/common/schemas/reward.schema';
import {
  RewardHistory,
  RewardHistorySchema,
} from '@libs/common/schemas/reward-history.schema';
import {
  UserAction,
  UserActionSchema,
} from '@libs/common/schemas/user-action.schema';
import { User, UserSchema } from '@libs/common/schemas/user.schema';
import { SeedService } from './seed.service';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condition.name, schema: ConditionSchema },
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardHistory.name, schema: RewardHistorySchema },
      { name: UserAction.name, schema: UserActionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
