import { MongooseModuleOptions } from '@nestjs/mongoose';

export const getMongoConfig = (): MongooseModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'dev';

  const configs = {
    dev: {
      uri: 'mongodb://localhost:27017/event-reward',
    },
    live: {
      uri: process.env.MONGO_URI,
    },
  };

  return configs[nodeEnv] || configs.dev;
};
