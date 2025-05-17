import { NestFactory } from '@nestjs/core';
import { MainModule } from './main.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  process.env.HOST = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3001';
  const app = await NestFactory.create(MainModule, {
    cors: true,
    bufferLogs: true,
  });
  Logger.log(`Auth Server is running on http://${process.env.HOST}:${port}`);
  await app.listen(port);
}

bootstrap();
