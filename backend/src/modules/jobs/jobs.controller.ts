import { Request, Response, NextFunction } from 'express';
import {
  createJob,
  getPublishedJobs,
  getJobById,
  updateJob,
  getRecruiterJobs,
  changeJobStatus,
} from './jobs.service';
import { successResponse } from '../../utils/response';
import { AppError } from '../../middleware/errorHandler';
import type { CreateJobInput, UpdateJobInput, JobQueryInput } from './jobs.validation';
import RecruiterProfile from '../profiles/recruiter-profile.model';

async function getRecruiterCompanyId(userId: string): Promise<string> {
  const profile = await RecruiterProfile.findOne({ userId }).lean().exec();
  if (!profile?.companyId) throw new AppError('Recruiter has no associated company.', 403);
  return profile.companyId.toString();
}

export async function createJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await getRecruiterCompanyId(req.session.userId!);
    const job = await createJob(req.body as CreateJobInput, req.session.userId!, companyId);
    successResponse(res, job, 'Job created successfully.', 201);
  } catch (err) { next(err); }
}

export async function listJobsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await getPublishedJobs(req.query as unknown as JobQueryInput);
    successResponse(res, result.jobs, 'Jobs retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function getJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const job = await getJobById(req.params.id);
    successResponse(res, job, 'Job details retrieved.');
  } catch (err) { next(err); }
}

export async function updateJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await getRecruiterCompanyId(req.session.userId!);
    const job = await updateJob(req.params.id, req.session.userId!, companyId, req.body as UpdateJobInput);
    successResponse(res, job, 'Job updated successfully.');
  } catch (err) { next(err); }
}

export async function listRecruiterJobsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await getRecruiterCompanyId(req.session.userId!);
    const jobs = await getRecruiterJobs(req.session.userId!, companyId);
    successResponse(res, jobs, 'Your jobs retrieved.');
  } catch (err) { next(err); }
}

export async function changeJobStatusHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const companyId = await getRecruiterCompanyId(req.session.userId!);
    const job = await changeJobStatus(req.params.id, req.session.userId!, companyId, req.body.status, req.session.role!);
    successResponse(res, job, 'Job status updated.');
  } catch (err) { next(err); }
}
