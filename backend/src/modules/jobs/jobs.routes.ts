import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
  updateJobStatusSchema,
} from './jobs.validation';
import {
  createJobHandler,
  listJobsHandler,
  getJobHandler,
  updateJobHandler,
  listRecruiterJobsHandler,
  changeJobStatusHandler,
} from './jobs.controller';

const router = Router();

// Public
router.get('/', validate(jobQuerySchema, 'query'), listJobsHandler);
router.get('/:id', getJobHandler);

// Recruiter routes
router.post('/', authenticate, authorize('recruiter'), validate(createJobSchema), createJobHandler);
router.patch('/:id', authenticate, authorize('recruiter', 'admin'), validate(updateJobSchema), updateJobHandler);
router.patch('/:id/status', authenticate, authorize('recruiter', 'admin'), validate(updateJobStatusSchema), changeJobStatusHandler);

// Recruiter — their jobs list
router.get('/me/list', authenticate, authorize('recruiter'), listRecruiterJobsHandler);

export default router;
