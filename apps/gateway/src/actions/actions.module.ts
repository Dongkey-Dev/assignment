import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ActionsController } from './actions.controller';
import { ActionsService } from './actions.service';
import {
  UserAction,
  UserActionSchema,
} from '@libs/common/schemas/user-action.schema';
import { jwtConfig } from '@libs/common/config/jwt.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAction.name, schema: UserActionSchema },
    ]),
    JwtModule.registerAsync(jwtConfig),
  ],
  controllers: [ActionsController],
  providers: [ActionsService],
})
export class ActionsModule {}
