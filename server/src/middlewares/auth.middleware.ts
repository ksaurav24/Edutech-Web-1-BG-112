import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/ApiError';
import { env } from '../config/env';

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        email?: string;
      };
    }
  }
}

function extractAccessToken(req: Request): string {
  const authHeader = req.header('authorization');
  if (!authHeader) {
    throw new UnauthorizedError('Authorization header is required');
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedError('Authorization header must be in Bearer format');
  }
  return token;
}

export function verifyAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const token = extractAccessToken(req);
    const decoded = jwt.verify(token, env.jwtAccessSecret);

    if (typeof decoded === 'string' || typeof decoded.sub !== 'string') {
      throw new UnauthorizedError('Invalid access token');
    }

    req.auth = {
      userId: decoded.sub,
      email: typeof decoded.email === 'string' ? decoded.email : undefined,
    };
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Access token expired'));
      return;
    }
    if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
      return;
    }
    next(err);
  }
}
