import dotenv from 'dotenv';

dotenv.config();

type NodeEnv = 'development' | 'production' | 'test';

function required(name: string): string {
  const v = process.env[name];
  if (!v || v.trim() === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

function optional(name: string, fallback: string): string {
  const v = process.env[name];
  return v && v.trim() !== '' ? v : fallback;
}

const nodeEnv = optional('NODE_ENV', 'development') as NodeEnv;

export const env = Object.freeze({
  nodeEnv,
  isProd: nodeEnv === 'production',
  isDev: nodeEnv === 'development',
  isTest: nodeEnv === 'test',
  port: Number(optional('PORT', '3000')),
  logLevel: optional('LOG_LEVEL', nodeEnv === 'production' ? 'info' : 'debug'),
  mongoUri: required('MONGODB_URI'),
  corsOrigin: optional('CORS_ORIGIN', '*'),
  appBaseUrl: optional('APP_BASE_URL', 'http://localhost:5173'),
  emailFrom: optional('EMAIL_FROM', 'StudyPro <no-reply@studypro.local>'),
  smtpHost: optional('SMTP_HOST', ''),
  smtpPort: Number(optional('SMTP_PORT', '587')),
  smtpSecure: optional('SMTP_SECURE', 'false') === 'true',
  smtpUser: optional('SMTP_USER', ''),
  smtpPass: optional('SMTP_PASS', ''),
  jwtAccessSecret: required('JWT_ACCESS_SECRET'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET'),
  jwtAccessTokenExpiresIn: optional('JWT_ACCESS_TOKEN_EXPIRES_IN', '15m'),
  jwtRefreshTokenExpiresIn: optional('JWT_REFRESH_TOKEN_EXPIRES_IN', '7d'),
  resetTokenExpiryMinutes: Number(optional('RESET_TOKEN_EXPIRY_MINUTES', '30')),
  cloudinaryCloudName: optional('CLOUDINARY_CLOUD_NAME', ''),
  cloudinaryApiKey: optional('CLOUDINARY_API_KEY', ''),
  cloudinaryApiSecret: optional('CLOUDINARY_API_SECRET', ''),
  cloudinaryFolder: optional('CLOUDINARY_FOLDER', 'studypro'),
});

export type Env = typeof env;
