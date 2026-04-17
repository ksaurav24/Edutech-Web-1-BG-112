import { Router } from 'express';
import { createPracticeController } from '../controllers/practice.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function practiceRouter(): Router {
  const router = Router();
  const practice = createPracticeController();

  router.use(verifyAuth);
  router.post('/chat', practice.chat);

  return router;
}
