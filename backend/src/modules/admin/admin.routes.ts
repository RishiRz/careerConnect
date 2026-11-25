import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import {
  getUsersHandler,
  changeUserStatusHandler,
  getPendingCompaniesHandler,
  verifyCompanyHandler,
  getPendingJobsHandler,
  moderateJobHandler,
  getAuditLogsHandler,
  getStatsHandler,
} from './admin.controller';

const router = Router();

//test
router.get('/test', (_req, res) => {
  res.json({ success: true, message: 'Admin router is working' });
});

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getStatsHandler);
router.get('/users', getUsersHandler);
router.patch('/users/:id/status', changeUserStatusHandler);
router.get('/companies/pending', getPendingCompaniesHandler);
router.patch('/companies/:id/verify', verifyCompanyHandler);
router.get('/jobs/pending', getPendingJobsHandler);
router.patch('/jobs/:id/moderate', moderateJobHandler);
router.get('/audit-logs', getAuditLogsHandler);

export default router;
