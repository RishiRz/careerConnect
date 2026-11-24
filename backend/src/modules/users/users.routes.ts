import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { getMeHandler, updateMeHandler } from './users.controller';

const router = Router();

router.get('/me', authenticate, getMeHandler);
router.patch('/me', authenticate, updateMeHandler);

export default router;
