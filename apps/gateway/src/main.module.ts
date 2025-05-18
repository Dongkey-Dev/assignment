import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ActionsModule } from './actions/actions.module';
import { EventsModule } from './events/events.module';
import { RewardsModule } from './rewards/rewards.module';
import { getMongoConfig } from '@libs/config/mongodb.config';

@Module({
  imports: [
    // 환경 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.gateway.${process.env.NODE_ENV || 'dev'}`],
    }),

    // MongoDB 연결 설정
    MongooseModule.forRootAsync({
      useFactory: () => getMongoConfig(),
    }),

    // 기능별 모듈
    AuthModule,
    ActionsModule,
    EventsModule,
    RewardsModule,
  ],
})
export class MainModule {}
