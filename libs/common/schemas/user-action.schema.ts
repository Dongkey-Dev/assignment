import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'user_actions' })
export class UserAction extends Document<string> {
  @Prop({ required: true })
  userId!: string;

  @Prop({ required: true })
  action!: string;

  @Prop({
    type: {
      target: {
        type: { type: String, enum: ['User', 'Product'], required: true },
        id: { type: String, required: true },
      },
      custom: { type: Object, default: {} },
    },
    required: true,
  })
  details!: {
    target: {
      type: string;
      id: string;
    };
    custom?: Record<string, any>;
  };

  @Prop({ required: true })
  timestamp!: Date;

  @Prop({ required: true, default: Date.now })
  createdAt!: Date;
}

export const UserActionSchema = SchemaFactory.createForClass(UserAction);

// Create indexes
UserActionSchema.index({ 'details.target.type': 1, 'details.target.id': 1 });
UserActionSchema.index({ userId: 1, timestamp: 1 });
