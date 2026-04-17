import { Router } from 'express';
import { Connection } from 'mongoose';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';

export function apiRouter(db?: Connection): Router {
  const router = Router(); 
  router.use('/health', healthRouter(db));
  router.use('/auth', authRouter());
  return router;
}

