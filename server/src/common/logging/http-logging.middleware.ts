import {
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class HttpLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(
    HttpLoggingMiddleware.name,
  );

  use(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    const startTime = Date.now();

    response.on('finish', () => {
      const duration = Date.now() - startTime;

      this.logger.log(
        `${request.method} ${request.path} ${response.statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
