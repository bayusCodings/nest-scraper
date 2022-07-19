import { Module, CacheModule } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';
import { RedisConfiguration } from 'src/config/configuration';
import { RedisService } from './redis.service';

const redisConfig = RedisConfiguration();

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: redisConfig.redisHost,
      port: redisConfig.redisPort,
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
