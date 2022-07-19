import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager-redis-store';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private keyPrefix = 'ldbrdsvc_';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    const client = this.cacheManager.store.getClient();
    client.on('error', (error) => {
      this.logger.error(`Error connecting to redis". ${error}`);
    });
  }

  async get<T>(key: string): Promise<T> {
    return new Promise((resolve, reject) => {
      this.cacheManager.get(
        `${this.keyPrefix + key}`,
        (error: any, result: any) => {
          if (error) return reject(error);
          return resolve(result || null);
        },
      );
    });
  }

  async set<T>(
    key: string,
    data: T,
    options: { [key: string]: any } = { ttl: 50000000 },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cacheManager.set(
        `${this.keyPrefix + key}`,
        data,
        options,
        (error: any) => {
          if (error) return reject(error);
          resolve();
        },
      );
    });
  }
}
