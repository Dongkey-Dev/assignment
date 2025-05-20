import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getMongoConfig } from '@libs/config/mongodb.config';
import { EventsModule } from './events/events.module';
import { RewardsModule } from './rewards/rewards.module';
import { SeedModule } from './seed/seed.module';
import { AuthModule } from '@libs/common/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '@libs/common/src/health';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.event.${process.env.NODE_ENV || 'dev'}`],
    }),
    // MongoDB Connection
    MongooseModule.forRootAsync({
      useFactory: () => getMongoConfig(),
    }),

    // Feature Modules
    EventsModule,
    RewardsModule,
    AuthModule,
    SeedModule,
    HealthModule,
  ],
})
export class MainModule {}
