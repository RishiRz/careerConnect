import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { uploadRateLimiter } from '../../middleware/rateLimiter';
import { resumeUpload } from '../../middleware/uploadSecurity';
import {
  uploadResumeHandler,
  getMyResumesHandler,
  downloadResumeHandler,
  deleteResumeHandler,
} from './resumes.controller';

const router = Router();

router.post('/upload', authenticate, authorize('jobseeker'), uploadRateLimiter, resumeUpload.single('resume'), uploadResumeHandler);
router.get('/me', authenticate, authorize('jobseeker'), getMyResumesHandler);
router.get('/:id/download', authenticate, downloadResumeHandler);
router.delete('/:id', authenticate, authorize('jobseeker'), deleteResumeHandler);

export default router;
