import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { getMongoConfig } from '../../../libs/config/mongodb.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      useFactory: () => getMongoConfig(),
    }),
    AuthModule,
  ],
})
export class MainModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req, res, next) => {
        Logger.log(`URL : ${req.url}`);
        if (req.body) Logger.log(`BODY : ${JSON.stringify(req.body)}`);

        const originalSend = res.send;
        res.send = function (body) {
          Logger.log(
            `RESPONSE BODY : ${body.length > 500 ? body.slice(0, 500) + '....' : body}`,
          );
          return originalSend.apply(this, [body]);
        };
        next();
      })
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
