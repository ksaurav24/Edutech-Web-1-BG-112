import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../utils/ApiError';

export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Route not found: ${req.method} ${req.originalUrl}`));
}

