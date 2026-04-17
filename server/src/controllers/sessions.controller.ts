import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import StudySession from '../models/studySession.model';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/ApiError';

export function createSessionsController() {
  return {
    list: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const sessions = await StudySession.find({ user: userId }).sort({ date: -1 }).lean();
        return ApiResponse.ok(res, sessions, 'Sessions fetched');
      } catch (err) {
        return next(err);
      }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const subject = String(req.body?.subject ?? '').trim();
        const duration = Number(req.body?.duration);
        const date = req.body?.date ? new Date(req.body.date) : new Date();

        if (!subject) throw new BadRequestError('Subject is required');
        if (!Number.isFinite(duration) || duration < 1)
          throw new BadRequestError('Duration must be a positive number (minutes)');
        if (isNaN(date.getTime())) throw new BadRequestError('Invalid date');

        const session = await StudySession.create({ user: userId, subject, duration, date });
        return ApiResponse.created(res, session.toObject(), 'Session created');
      } catch (err) {
        return next(err);
      }
    },

    remove: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) throw new BadRequestError('Invalid session id');

        const session = await StudySession.findById(id);
        if (!session) throw new NotFoundError('Session not found');
        if (session.user.toString() !== userId) throw new ForbiddenError('Access denied');

        await session.deleteOne();
        return ApiResponse.noContent(res);
      } catch (err) {
        return next(err);
      }
    },
  };
}
