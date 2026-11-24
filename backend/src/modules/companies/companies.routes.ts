import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { createCompanySchema, updateCompanySchema } from './companies.validation';
import {
  createCompanyHandler,
  listCompaniesHandler,
  getCompanyHandler,
  updateCompanyHandler,
} from './companies.controller';

const router = Router();

router.get('/', listCompaniesHandler);
router.get('/:id', getCompanyHandler);
router.post('/', authenticate, authorize('recruiter'), validate(createCompanySchema), createCompanyHandler);
router.patch('/:id', authenticate, authorize('recruiter', 'admin'), validate(updateCompanySchema), updateCompanyHandler);

export default router;
