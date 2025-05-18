import { NestFactory } from '@nestjs/core';
import { Logger, VersioningType } from '@nestjs/common';
import { MainModule } from './main.module';

async function bootstrap() {
  const app = await NestFactory.create(MainModule);
  const port = process.env.PORT || 3003;

  // Enable CORS
  app.enableCors();

  // Enable API versioning
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'api',
  });

  Logger.log(
    `Event Server is running on http://${process.env.HOST}:${port}/api/v1`,
  );
  await app.listen(port); // Use port 3003 for event server
}

bootstrap();
