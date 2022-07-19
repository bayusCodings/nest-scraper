import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { ScraperModule } from './modules/scraper/scraper.module';

@Module({
  imports: [ScraperModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestLoggerMiddleware)
      .exclude('health/(.*)')
      .forRoutes('*');
  }
}
