import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  /**
   * Check the health of the service and its dependencies
   * @returns Health status information
   */
  check() {
    const mongoStatus = this.checkMongoConnection();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: process.env.SERVICE_NAME || 'unknown',
      dependencies: {
        mongodb: mongoStatus,
      },
    };
  }

  /**
   * Check MongoDB connection status
   * @returns MongoDB connection status
   */
  private checkMongoConnection() {
    try {
      // Check if MongoDB connection is ready
      const isConnected = this.mongoConnection.readyState === 1;

      return {
        status: isConnected ? 'connected' : 'disconnected',
        readyState: this.mongoConnection.readyState,
      };
    } catch (error) {
      return {
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
