import { JwtModuleOptions, JwtModuleAsyncOptions } from '@nestjs/jwt';

export const getJwtConfig = (): JwtModuleOptions => {
  const nodeEnv = process.env.NODE_ENV || 'dev';

  const configs = {
    dev: {
      secret: process.env.JWT_SECRET || 'DEV_TEMP_SECRET',
      signOptions: { expiresIn: '1d' },
    },
    live: {
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    },
  };

  return configs[nodeEnv] || configs.dev;
};

export const jwtConfig: JwtModuleAsyncOptions = {
  useFactory: getJwtConfig,
};
