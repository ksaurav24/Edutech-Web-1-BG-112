import mongoose, { Connection } from 'mongoose';
import { logger } from '../utils/logger';
import { env } from '../config/env';

mongoose.set('strictQuery', true);

export async function connectDB(uri: string = env.mongoUri): Promise<Connection> {
  try {
    await mongoose.connect(uri, {
      autoIndex: !env.isProd,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      maxPoolSize: 50,
      minPoolSize: 5,
      retryWrites: true,
    });

    const conn = mongoose.connection;

    conn.on('connected', () => logger.info('mongo: connected'));
    conn.on('disconnected', () => logger.warn('mongo: disconnected'));
    conn.on('reconnected', () => logger.info('mongo: reconnected'));
    conn.on('error', (err) => logger.error({ err }, 'mongo: connection error'));

    logger.info({ host: conn.host, name: conn.name }, 'mongo: ready');
    return conn;
  } catch (err) {
    logger.error({ err }, 'mongo: initial connection failed');
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('mongo: closed');
  }
}

