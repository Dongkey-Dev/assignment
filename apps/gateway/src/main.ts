import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const port = process.env.PORT || 3002;

  // 애플리케이션 생성
  const app = await NestFactory.create(MainModule);

  // API 경로에 전역 prefix 설정
  app.setGlobalPrefix('api/v1');

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
