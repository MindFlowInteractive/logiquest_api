import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

/**
 * Logs a single structured line for every HTTP request once the response has
 * been sent, capturing method, path, status code and wall-clock duration.
 *
 * The log is emitted on the response `finish` event so the final status code
 * and total processing time (including the handler and downstream middleware)
 * are accurate. Severity is derived from the status class so error responses
 * surface at the appropriate level for alerting.
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime.bigint();
    // `originalUrl` preserves the full path + query string before routing.
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
      const { statusCode } = res;
      const message = `${method} ${originalUrl} ${statusCode} ${durationMs.toFixed(1)}ms`;

      if (statusCode >= 500) {
        this.logger.error(message);
      } else if (statusCode >= 400) {
        this.logger.warn(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
