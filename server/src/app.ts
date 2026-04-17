import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Connection } from 'mongoose';
import { env } from './config/env';
import { requestId } from './middlewares/requestId';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { apiRouter } from './routes';

export function createApp(db?: Connection): Application {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestId);
  app.use(requestLogger);

  app.use('/api/v1', apiRouter(db));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

