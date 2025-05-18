import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reward } from './reward.schema';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class RewardHistory extends Document<string> {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  eventId!: string;

  @Prop({ required: true })
  rewardId!: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  reward!: Reward;

  @Prop({
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  })
  status!: string;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export const RewardHistorySchema = SchemaFactory.createForClass(RewardHistory);
