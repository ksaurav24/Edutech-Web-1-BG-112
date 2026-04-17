import { NextFunction, Request, Response } from 'express';
import { ApiError, InternalServerError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const apiError =
    err instanceof ApiError
      ? err
      : new InternalServerError(
          err instanceof Error ? err.message : 'Unknown error',
          [],
          undefined,
          { cause: err, isOperational: false },
        );

  const requestId = typeof req.id === 'string' ? req.id : String(req.id);
  apiError.requestId = requestId;

  const logPayload = {
    requestId,
    method: req.method,
    url: req.originalUrl,
    statusCode: apiError.statusCode,
    code: apiError.code,
    err: apiError,
  };

  if (apiError.statusCode >= 500 || !apiError.isOperational) {
    logger.error(logPayload, apiError.message);
  } else {
    logger.warn(logPayload, apiError.message);
  }

  res.status(apiError.statusCode).json(apiError.toJSON(!env.isProd));
}

