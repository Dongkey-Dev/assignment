import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { Logger } from '@nestjs/common';
import { VersioningType } from '@nestjs/common';

async function bootstrap() {
  process.env.HOST = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3001';
  const app = await NestFactory.create(MainModule, {
    cors: true,
    bufferLogs: true,
  });

  // API 경로에 전역 prefix 설정
  app.setGlobalPrefix('api');

  // 버전닝 설정
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  Logger.log(
    `Auth Server is running on http://${process.env.HOST}:${port}/api/v1`,
  );
  await app.listen(port);
}

bootstrap();
