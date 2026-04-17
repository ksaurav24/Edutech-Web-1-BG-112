import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/ApiResponse';
import { UnauthorizedError } from '../utils/ApiError';
import * as authService from '../services/auth.service';

export function createAuthController() {
  return {
    signup: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.signup({
          name: String(req.body?.name ?? ''),
          email: String(req.body?.email ?? ''),
          password: String(req.body?.password ?? ''),
        });
        return ApiResponse.created(res, result, 'Signup successful');
      } catch (err) {
        return next(err);
      }
    },
    login: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.login({
          email: String(req.body?.email ?? ''),
          password: String(req.body?.password ?? ''),
        });
        return ApiResponse.ok(res, result, 'Login successful');
      } catch (err) {
        return next(err);
      }
    },
    forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await authService.forgotPassword({
          email: String(req.body?.email ?? ''),
        });
        return ApiResponse.ok(
          res,
          {},
          'If an account with that email exists, a password reset link has been sent',
        );
      } catch (err) {
        return next(err);
      }
    },
    refreshToken: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const result = await authService.refreshToken({
          refreshToken: String(req.body?.refreshToken ?? ''),
        });
        return ApiResponse.ok(res, result, 'Token refreshed');
      } catch (err) {
        return next(err);
      }
    },
    verify: (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!req.auth) {
          throw new UnauthorizedError('Unauthorized');
        }
        return ApiResponse.ok(
          res,
          { userId: req.auth.userId, email: req.auth.email },
          'Token is valid',
        );
      } catch (err) {
        return next(err);
      }
    },
  };
}
