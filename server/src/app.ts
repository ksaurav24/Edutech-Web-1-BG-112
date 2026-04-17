import express, { Application } from 'express'; 
import cors from 'cors';
import { Connection } from 'mongoose'; 
import { requestId } from './middlewares/requestId';
import { requestLogger } from './middlewares/requestLogger';
import { errorHandler } from './middlewares/errorHandler';
import { notFound } from './middlewares/notFound';
import { apiRouter } from './routes';

export function createApp(db?: Connection): Application {
  const app = express();
  
  app.use(cors({
    origin: "http://127.0.0.1:3000",
    credentials: true,
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use(requestId);
  app.use(requestLogger);

  app.use('/api/v1', apiRouter(db));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

