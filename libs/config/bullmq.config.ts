import { BullModuleOptions } from '@nestjs/bull';

export const getBullConfig = (queueName: string): BullModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'dev';

  const configs = {
    dev: {
      name: queueName,
      redis: {
        host: 'localhost',
        port: 6379,
      },
    },
    live: {
      name: queueName,
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    },
  };

  return configs[nodeEnv] || configs.dev;
};
