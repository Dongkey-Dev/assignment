import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'conditions' })
export class Condition extends Document<string> {
  @Prop({ required: true })
  eventId!: string;

  @Prop({ required: true })
  actionType!: string;

  @Prop({ required: true })
  conditionType!: string;

  @Prop({ required: true })
  targetCount!: number;

  @Prop({ required: true, enum: ['active', 'inactive'], default: 'active' })
  status!: string;

  @Prop({
    type: {
      targetCollection: { type: String, required: true },
      filter: { type: Object, required: true },
      sum: { type: String },
    },
    required: true,
  })
  targetCountQuery!: {
    targetCollection: string;
    filter: any;
    sum?: string;
  };

  @Prop({
    type: {
      targetType: { type: String, required: true },
      targetIdField: { type: String, required: true },
    },
    required: true,
  })
  context!: {
    targetType: string;
    targetIdField: string;
  };

  @Prop({
    type: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    required: true,
  })
  period!: {
    start: Date;
    end: Date;
  };

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;

  @Prop({ required: true, default: Date.now })
  updatedAt!: Date;
}

export const ConditionSchema = SchemaFactory.createForClass(Condition);

// Create index
ConditionSchema.index({ eventId: 1 });
