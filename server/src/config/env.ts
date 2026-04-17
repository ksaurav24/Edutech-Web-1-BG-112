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
});

export type Env = typeof env;
