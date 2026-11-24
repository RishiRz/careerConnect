import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getNotificationsHandler, markReadHandler, markAllReadHandler } from './notifications.controller';

const router = Router();

router.get('/', authenticate, getNotificationsHandler);
router.patch('/:id/read', authenticate, markReadHandler);
router.patch('/read-all', authenticate, markAllReadHandler);

export default router;
