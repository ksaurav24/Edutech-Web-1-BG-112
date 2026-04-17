import { Router } from 'express';
import { createProfileController } from '../controllers/profile.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function profileRouter(): Router {
  const router = Router();
  const profile = createProfileController();

  router.use(verifyAuth);

  router.get('/', profile.get);
  router.patch('/', profile.update);
  router.patch('/preferences', profile.updatePreferences);

  return router;
}
