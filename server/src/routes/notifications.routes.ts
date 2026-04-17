import { Router } from 'express';
import { createNotificationsController } from '../controllers/notifications.controller';
import { verifyAuth } from '../middlewares/auth.middleware';

export function notificationsRouter(): Router {
  const router = Router();
  const notifications = createNotificationsController();

  router.use(verifyAuth);

  router.get('/', notifications.list);
  router.patch('/mark-all-read', notifications.markAllRead);

  return router;
}
