import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Goal from '../models/goal.model';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/ApiError';

export function createGoalsController() {
  return {
    list: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const goals = await Goal.find({ user: userId }).sort({ createdAt: -1 }).lean();
        return ApiResponse.ok(res, goals, 'Goals fetched');
      } catch (err) {
        return next(err);
      }
    },

    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const text = String(req.body?.text ?? '').trim();
        if (!text) throw new BadRequestError('Goal text is required');

        const goal = await Goal.create({ user: userId, text });
        return ApiResponse.created(res, goal.toObject(), 'Goal created');
      } catch (err) {
        return next(err);
      }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) throw new BadRequestError('Invalid goal id');

        const goal = await Goal.findById(id);
        if (!goal) throw new NotFoundError('Goal not found');
        if (goal.user.toString() !== userId) throw new ForbiddenError('Access denied');

        if (req.body?.text !== undefined) goal.text = String(req.body.text).trim();
        if (req.body?.done !== undefined) goal.done = Boolean(req.body.done);

        await goal.save();
        return ApiResponse.ok(res, goal.toObject(), 'Goal updated');
      } catch (err) {
        return next(err);
      }
    },

    remove: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) throw new BadRequestError('Invalid goal id');

        const goal = await Goal.findById(id);
        if (!goal) throw new NotFoundError('Goal not found');
        if (goal.user.toString() !== userId) throw new ForbiddenError('Access denied');

        await goal.deleteOne();
        return ApiResponse.noContent(res);
      } catch (err) {
        return next(err);
      }
    },
  };
}
