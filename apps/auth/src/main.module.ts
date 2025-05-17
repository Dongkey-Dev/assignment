import { Logger, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthModule } from './auth/auth.module';
import { MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      ignoreErrors: false,
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
