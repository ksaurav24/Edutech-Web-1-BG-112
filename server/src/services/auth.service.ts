import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HydratedDocument } from 'mongoose';
import { createHash, randomBytes } from 'crypto';
import User, { IUser } from '../models/user.model';
import { env } from '../config/env';
import { BadRequestError, ConflictError, UnauthorizedError } from '../utils/ApiError';
import { sendForgotPasswordEmail } from '../utils/mailer';

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface RefreshTokenInput {
  refreshToken: string;
}

interface ForgotPasswordInput {
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  skillLevel: IUser['skillLevel'];
  interests: string[];
  streak: number;
  totalHours: number;
  joinDate: Date;
  theme: IUser['theme'];
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}

const SALT_ROUNDS = 10;

function normalizeEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    throw new BadRequestError('Email is required');
  }
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
  if (!isValidEmail) {
    throw new BadRequestError('Invalid email format');
  }
  return normalized;
}

function validatePassword(password: string): void {
  if (!password || password.trim().length < 8) {
    throw new BadRequestError('Password must be at least 8 characters long');
  }
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user: HydratedDocument<IUser>): string {
  return jwt.sign(
    { email: user.email },
    env.jwtAccessSecret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtAccessTokenExpiresIn as jwt.SignOptions['expiresIn'],
    },
  );
}

function signRefreshToken(user: HydratedDocument<IUser>): string {
  return jwt.sign(
    {},
    env.jwtRefreshSecret,
    {
      subject: user._id.toString(),
      expiresIn: env.jwtRefreshTokenExpiresIn as jwt.SignOptions['expiresIn'],
    },
  );
}

function issueTokens(user: HydratedDocument<IUser>): AuthTokens {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  return { accessToken, refreshToken };
}

function toPublicUser(user: HydratedDocument<IUser>): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    skillLevel: user.skillLevel,
    interests: user.interests,
    streak: user.streak,
    totalHours: user.totalHours,
    joinDate: user.joinDate,
    theme: user.theme,
  };
}

function getSubject(decoded: string | jwt.JwtPayload): string {
  if (typeof decoded === 'string') {
    throw new UnauthorizedError('Invalid refresh token');
  }
  if (!decoded.sub || typeof decoded.sub !== 'string') {
    throw new UnauthorizedError('Invalid refresh token');
  }
  return decoded.sub;
}

export async function signup(input: SignupInput): Promise<AuthResult> {
  const name = input.name.trim();
  if (!name) {
    throw new BadRequestError('Name is required');
  }
  const email = normalizeEmail(input.email);
  validatePassword(input.password);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    name,
    email,
    password: passwordHash,
  });

  const tokens = issueTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  return { user: toPublicUser(user), tokens };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = normalizeEmail(input.email);
  if (!input.password) {
    throw new BadRequestError('Password is required');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);
  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = issueTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  return { user: toPublicUser(user), tokens };
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const email = normalizeEmail(input.email);
  const user = await User.findOne({ email });
  if (!user) {
    return;
  }

  const rawResetToken = randomBytes(32).toString('hex');
  user.resetPasswordToken = hashToken(rawResetToken);
  user.resetPasswordExpiresAt = new Date(Date.now() + env.resetTokenExpiryMinutes * 60_000);
  await user.save();

  const baseUrl = env.appBaseUrl.replace(/\/$/, '');
  const resetUrl = `${baseUrl}/reset-password?token=${rawResetToken}&email=${encodeURIComponent(email)}`;
  await sendForgotPasswordEmail({
    to: user.email,
    name: user.name,
    resetUrl,
  });
}

export async function refreshToken(input: RefreshTokenInput): Promise<AuthResult> {
  const incomingToken = input.refreshToken?.trim();
  if (!incomingToken) {
    throw new BadRequestError('Refresh token is required');
  }

  let decoded: string | jwt.JwtPayload;
  try {
    decoded = jwt.verify(incomingToken, env.jwtRefreshSecret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
    throw err;
  }

  const userId = getSubject(decoded);
  const user = await User.findById(userId);
  if (!user || !user.refreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (user.refreshToken !== hashToken(incomingToken)) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const tokens = issueTokens(user);
  user.refreshToken = hashToken(tokens.refreshToken);
  await user.save();

  return { user: toPublicUser(user), tokens };
}
