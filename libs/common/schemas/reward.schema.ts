import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Reward extends Document<string> {
  @Prop({ required: true })
  eventId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true, enum: ['POINT', 'ITEM', 'COUPON'] })
  type!: string;

  @Prop({
    type: {
      amount: { type: Number, required: true },
      metadata: { type: Object, default: {} },
    },
    required: true,
  })
  value!: {
    amount: number;
    metadata?: Record<string, any>;
  };

  @Prop({
    type: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
  })
  period?: {
    start: Date;
    end: Date;
  };

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status!: string;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
