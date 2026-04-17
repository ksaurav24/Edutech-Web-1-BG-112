import { Router } from 'express';
import { createAuthController } from '../controllers/auth.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function authRouter(): Router {
  const router = Router();
  const auth = createAuthController();

  router.post('/signup', auth.signup);
  router.post('/login', auth.login);
  router.post('/forgot-password', auth.forgotPassword);
  router.post('/refresh-token', auth.refreshToken);
  router.get('/verify', verifyAuth, auth.verify);

  return router;
}
