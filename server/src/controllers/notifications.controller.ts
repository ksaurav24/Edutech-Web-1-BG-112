import { NextFunction, Request, Response } from 'express';
import Notification from '../models/notification.model';
import { ApiResponse } from '../utils/ApiResponse';

export function createNotificationsController() {
  return {
    list: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 }).lean();
        return ApiResponse.ok(res, notifications, 'Notifications fetched');
      } catch (err) {
        return next(err);
      }
    },

    markAllRead: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        await Notification.updateMany({ user: userId, read: false }, { $set: { read: true } });
        return ApiResponse.ok(res, {}, 'All notifications marked as read');
      } catch (err) {
        return next(err);
      }
    },
  };
}
