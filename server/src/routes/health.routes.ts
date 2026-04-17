import { Router } from 'express';
import { Connection } from 'mongoose';
import { createHealthController } from '../controllers/health.controller';

export function healthRouter(db?: Connection): Router {
  const router = Router();
  const health = createHealthController(db);

  router.get('/', health.liveness);
  router.get('/ready', health.readiness);

  return router;
}

  