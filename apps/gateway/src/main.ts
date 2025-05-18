import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';

async function bootstrap() {
  const port = process.env.PORT || 3002;
  const app = await NestFactory.create(MainModule);

  // API 경로에 전역 prefix 설정
  app.setGlobalPrefix('api/v1');

  // CORS 설정
  app.enableCors();

  await app.listen(port);
  console.log(`Gateway server is running on: ${await app.getUrl()}`);
}

bootstrap();
