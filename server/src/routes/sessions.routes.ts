import { Router } from 'express';
import { createSessionsController } from '../controllers/sessions.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function sessionsRouter(): Router {
  const router = Router();
  const sessions = createSessionsController();

  router.use(verifyAuth);

  router.get('/', sessions.list);
  router.post('/', sessions.create);
  router.delete('/:id', sessions.remove);

  return router;
}
