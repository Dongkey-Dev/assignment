import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { Logger } from '@nestjs/common';
import { NestiaSwaggerComposer } from '@nestia/sdk';
import { SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3002;

  // 애플리케이션 생성
  const app = await NestFactory.create(MainModule);
  const document = await NestiaSwaggerComposer.document(app, {
    openapi: '3.1',
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Local / Docker Gateway Server',
      },
    ],
  });

  // body-parser 설정 (요청 본문 파싱을 위해)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
  SwaggerModule.setup('api-docs', app, document as any);
  // CORS 설정
  app.enableCors();

  // 프록시 미들웨어 적용 (전역)
  const proxyMiddleware = app.get(ProxyMiddleware);
  app.use(proxyMiddleware.use.bind(proxyMiddleware));

  logger.log('Proxy middleware has been applied globally');

  await app.listen(port);
  logger.log(`Gateway server is running on: ${await app.getUrl()}`);
}

bootstrap();
