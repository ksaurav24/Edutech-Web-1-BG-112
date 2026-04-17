import { Router } from 'express';
import { createGoalsController } from '../controllers/goals.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function goalsRouter(): Router {
  const router = Router();
  const goals = createGoalsController();

  router.use(verifyAuth);

  router.get('/', goals.list);
  router.post('/', goals.create);
  router.patch('/:id', goals.update);
  router.delete('/:id', goals.remove);

  return router;
}
