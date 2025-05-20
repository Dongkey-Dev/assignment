import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { ActionsModule } from './actions/actions.module';
import { EventsModule } from './events/events.module';
import { RewardsModule } from './rewards/rewards.module';
import { getMongoConfig } from '@libs/config/mongodb.config';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { HealthModule } from '@libs/common/src/health';

@Module({
  imports: [
    // 환경 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.gateway.${process.env.NODE_ENV || 'dev'}`],
    }),

    // JWT 인증 모듈
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
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
    HealthModule,
  ],
  providers: [ProxyMiddleware],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply proxy middleware to all routes except /health
    consumer.apply(ProxyMiddleware).exclude('health').forRoutes('*');
  }
}
