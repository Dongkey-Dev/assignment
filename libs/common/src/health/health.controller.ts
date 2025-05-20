import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Health check endpoint
   * @returns Health status of the service
   */
  @Get()
  check() {
    return this.healthService.check();
  }
}
