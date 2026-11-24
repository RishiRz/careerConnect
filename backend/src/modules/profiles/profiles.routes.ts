import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  getProfileHandler,
  updateProfileHandler,
  addEducationHandler,
  removeEducationHandler,
  addWorkExperienceHandler,
  removeWorkExperienceHandler,
  saveJobHandler,
  unsaveJobHandler,
} from './profiles.controller';

const router = Router();

router.get('/me', authenticate, authorize('jobseeker'), getProfileHandler);
router.patch('/me', authenticate, authorize('jobseeker'), updateProfileHandler);
router.post('/me/education', authenticate, authorize('jobseeker'), addEducationHandler);
router.delete('/me/education/:educationId', authenticate, authorize('jobseeker'), removeEducationHandler);
router.post('/me/experience', authenticate, authorize('jobseeker'), addWorkExperienceHandler);
router.delete('/me/experience/:expId', authenticate, authorize('jobseeker'), removeWorkExperienceHandler);
router.post('/me/saved-jobs/:jobId', authenticate, authorize('jobseeker'), saveJobHandler);
router.delete('/me/saved-jobs/:jobId', authenticate, authorize('jobseeker'), unsaveJobHandler);

export default router;
