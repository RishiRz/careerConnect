import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  submitApplicationSchema,
  updateApplicationStatusSchema,
} from './applications.validation';
import {
  submitApplicationHandler,
  getMyApplicationsHandler,
  getApplicationByIdHandler,
  withdrawApplicationHandler,
  updateApplicationStatusHandler,
  getJobApplicantsHandler,
} from './applications.controller';

const router = Router();

// Job seeker routes
router.post('/', authenticate, authorize('jobseeker'), validate(submitApplicationSchema), submitApplicationHandler);
router.get('/me', authenticate, authorize('jobseeker'), getMyApplicationsHandler);
router.get('/:id', authenticate, getApplicationByIdHandler);
router.delete('/:id', authenticate, authorize('jobseeker'), withdrawApplicationHandler);

// Recruiter routes
router.patch('/:id/status', authenticate, authorize('recruiter'), validate(updateApplicationStatusSchema), updateApplicationStatusHandler);
router.get('/job/:jobId/applicants', authenticate, authorize('recruiter'), getJobApplicantsHandler);

export default router;
