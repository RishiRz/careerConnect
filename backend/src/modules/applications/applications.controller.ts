import { Request, Response, NextFunction } from 'express';
import {
  submitApplication,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  updateApplicationStatus,
  getJobApplicants,
} from './applications.service';
import { successResponse } from '../../utils/response';
import RecruiterProfile from '../profiles/recruiter-profile.model';
import { AppError } from '../../middleware/errorHandler';
import type { SubmitApplicationInput, UpdateApplicationStatusInput } from './applications.validation';

async function getRecruiterCompanyId(userId: string): Promise<string> {
  const profile = await RecruiterProfile.findOne({ userId }).lean().exec();
  if (!profile?.companyId) throw new AppError('Recruiter has no associated company.', 403);
  return profile.companyId.toString();
}

export async function submitApplicationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const app = await submitApplication(req.body as SubmitApplicationInput, req.session.userId!);
    successResponse(res, app, 'Application submitted successfully.', 201);
  } catch (err) { next(err); }
}

export async function getMyApplicationsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const result = await getMyApplications(req.session.userId!, page, limit);
    successResponse(res, result.applications, 'Applications retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function getApplicationByIdHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const app = await getApplicationById(req.params.id, req.session.userId!, req.session.role!);
    successResponse(res, app, 'Application retrieved.');
  } catch (err) { next(err); }
}

export async function withdrawApplicationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await withdrawApplication(req.params.id, req.session.userId!);
    successResponse(res, null, 'Application withdrawn.');
  } catch (err) { next(err); }
}

export async function updateApplicationStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await getRecruiterCompanyId(req.session.userId!);
    const app = await updateApplicationStatus(req.params.id, req.session.userId!, companyId, req.body as UpdateApplicationStatusInput);
    successResponse(res, app, 'Application status updated.');
  } catch (err) { next(err); }
}

export async function getJobApplicantsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await getRecruiterCompanyId(req.session.userId!);
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const result = await getJobApplicants(req.params.jobId, req.session.userId!, companyId, page, limit);
    successResponse(res, result.applications, 'Applicants retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}
