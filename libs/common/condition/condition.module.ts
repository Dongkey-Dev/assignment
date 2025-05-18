import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Condition, ConditionSchema } from '../schemas/condition.schema';
import { UserAction, UserActionSchema } from '../schemas/user-action.schema';
import { RewardsConditionCheckerService } from '../../../apps/event/src/rewards/rewards-condition-checker.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Condition.name, schema: ConditionSchema },
      { name: UserAction.name, schema: UserActionSchema },
    ]),
  ],
  providers: [RewardsConditionCheckerService],
  exports: [RewardsConditionCheckerService],
})
export class ConditionModule {}
