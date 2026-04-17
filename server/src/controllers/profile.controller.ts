import { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import { ApiResponse } from '../utils/ApiResponse';
import { BadRequestError, NotFoundError } from '../utils/ApiError';
import { uploadImage } from '../services/cloudinary';
import { env } from '../config/env';

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const THEMES = ['light', 'dark'] as const;

export function createProfileController() {
  return {
    get: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const user = await User.findById(userId).lean();
        if (!user) throw new NotFoundError('User not found');

        const { password, refreshToken, resetPasswordToken, resetPasswordExpiresAt, __v, ...profile } = user as any;
        return ApiResponse.ok(res, profile, 'Profile fetched');
      } catch (err) {
        return next(err);
      }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const updates: Record<string, unknown> = {};

        if (req.body?.name !== undefined) {
          const name = String(req.body.name).trim();
          if (!name) throw new BadRequestError('Name cannot be empty');
          updates.name = name;
        }

        if (req.body?.avatar !== undefined) {
          updates.avatar = req.body.avatar ? String(req.body.avatar) : null;
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).lean();
        if (!user) throw new NotFoundError('User not found');

        const { password, refreshToken, resetPasswordToken, resetPasswordExpiresAt, __v, ...profile } = user as any;
        return ApiResponse.ok(res, profile, 'Profile updated');
      } catch (err) {
        return next(err);
      }
    },

    updatePreferences: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const updates: Record<string, unknown> = {};

        if (req.body?.theme !== undefined) {
          if (!THEMES.includes(req.body.theme)) throw new BadRequestError('Theme must be "light" or "dark"');
          updates.theme = req.body.theme;
        }

        if (req.body?.skillLevel !== undefined) {
          if (!SKILL_LEVELS.includes(req.body.skillLevel))
            throw new BadRequestError('skillLevel must be Beginner, Intermediate, or Advanced');
          updates.skillLevel = req.body.skillLevel;
        }

        if (req.body?.interests !== undefined) {
          if (!Array.isArray(req.body.interests))
            throw new BadRequestError('Interests must be an array of strings');
          updates.interests = (req.body.interests as unknown[]).map((i) => String(i).trim()).filter(Boolean);
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).lean();
        if (!user) throw new NotFoundError('User not found');

        const { password, refreshToken, resetPasswordToken, resetPasswordExpiresAt, __v, ...profile } = user as any;
        return ApiResponse.ok(res, profile, 'Preferences updated');
      } catch (err) {
        return next(err);
      }
    },

    uploadAvatar: async (req: Request, res: Response, next: NextFunction) => {
      try {
        const userId = req.auth!.userId;
        const avatar = req.body?.avatar;

        if (typeof avatar !== 'string' || !avatar.startsWith('data:image/')) {
          throw new BadRequestError('avatar must be a base64 image data URL');
        }

        const secure_url = await uploadImage(avatar, env.cloudinaryFolder);

        const user = await User.findByIdAndUpdate(
          userId,
          { $set: { avatar: secure_url } },
          { new: true, runValidators: true },
        ).lean();
        if (!user) throw new NotFoundError('User not found');

        const { password, refreshToken, resetPasswordToken, resetPasswordExpiresAt, __v, ...profile } = user as any;
        return ApiResponse.ok(res, profile, 'Avatar updated');
      } catch (err) {
        return next(err);
      }
    },
  };
}
