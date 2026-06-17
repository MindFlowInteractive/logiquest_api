import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LoggingMiddleware } from './common/middleware/logging.middleware';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Log every inbound request across all routes.
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
