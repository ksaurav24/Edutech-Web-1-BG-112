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
    origin: "https://comforting-mochi-d4220f.netlify.app/",
    credentials: true,
  }));

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.use(requestId);
  app.use(requestLogger);

  app.use('/api/v1', apiRouter(db));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

