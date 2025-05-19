import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  const port = process.env.PORT || 3003;

  // Enable CORS
  app.enableCors();

  Logger.log(`Event Server is running on http://${process.env.HOST}:${port}`);
  await app.listen(port); // Use port 3003 for event server
}

bootstrap();
