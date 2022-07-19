import { registerAs } from '@nestjs/config';
import { GeneralAppConfig, RedisConfig } from './types';

export const AppConfig = registerAs(
  'appConfig',
  (): GeneralAppConfig => ({
    environment: process.env.NODE_ENV,
  }),
);

export const RedisConfiguration = registerAs(
  'redisConfig',
  (): RedisConfig => ({
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
  }),
);
