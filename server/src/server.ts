import http from 'http';
import { createApp } from './app';
import { connectDB, disconnectDB } from './db/connectDB';
import { logger } from './utils/logger';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  const dbConn = await connectDB();
  const app = createApp(dbConn);
  const server = http.createServer(app);
  
  server.listen(env.port, () => {
    logger.info({ port: env.port, env: env.nodeEnv }, 'http: listening');
  });

  const shutdown = async (signal: string, exitCode = 0) => {
    logger.warn({ signal }, 'shutdown: starting graceful shutdown');

    await new Promise<void>((resolve) => server.close(() => resolve()));
    logger.info('shutdown: http server closed');

    try {
      await disconnectDB();
    } catch (err) {
      logger.error({ err }, 'shutdown: error closing db');
    }

    logger.info('shutdown: complete');
    process.exit(exitCode);
  };

  const forceExitAfter = (ms: number) =>
    setTimeout(() => {
      logger.error('shutdown: forced exit (timeout)');
      process.exit(1);
    }, ms).unref();

  (['SIGINT', 'SIGTERM'] as const).forEach((sig) => {
    process.on(sig, () => {
      forceExitAfter(15_000);
      void shutdown(sig);
    });
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'uncaughtException');
    forceExitAfter(5_000);
    void shutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'unhandledRejection');
    forceExitAfter(5_000);
    void shutdown('unhandledRejection', 1);
  });
}

bootstrap().catch((err) => {
  logger.fatal({ err }, 'bootstrap failed');
  process.exit(1);
});
