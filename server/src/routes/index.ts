import { Router } from 'express';
import { Connection } from 'mongoose';
import { healthRouter } from './health.routes';
import { authRouter } from './auth.routes';
import { goalsRouter } from './goals.routes';
import { sessionsRouter } from './sessions.routes';
import { profileRouter } from './profile.routes';
import { notificationsRouter } from './notifications.routes';

export function apiRouter(db?: Connection): Router {
  const router = Router();
  router.use('/health', healthRouter(db));
  router.use('/auth', authRouter());
  router.use('/goals', goalsRouter());
  router.use('/sessions', sessionsRouter());
  router.use('/profile', profileRouter());
  router.use('/notifications', notificationsRouter());
  return router;
}

