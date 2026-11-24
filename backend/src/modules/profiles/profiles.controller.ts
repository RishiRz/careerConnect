import { Request, Response, NextFunction } from 'express';
import {
  getJobSeekerProfile,
  updateJobSeekerProfile,
  addEducation,
  removeEducation,
  addWorkExperience,
  removeWorkExperience,
  saveJob,
  unsaveJob,
} from './profiles.service';
import { successResponse } from '../../utils/response';
import type { IEducation, IWorkExperience } from './jobseeker-profile.model';

export async function getProfileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await getJobSeekerProfile(req.session.userId!);
    successResponse(res, profile, 'Profile retrieved.');
  } catch (err) { next(err); }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await updateJobSeekerProfile(req.session.userId!, req.body);
    successResponse(res, profile, 'Profile updated.');
  } catch (err) { next(err); }
}

export async function addEducationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await addEducation(req.session.userId!, req.body as IEducation);
    successResponse(res, profile, 'Education added.', 201);
  } catch (err) { next(err); }
}

export async function removeEducationHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await removeEducation(req.session.userId!, req.params.educationId);
    successResponse(res, profile, 'Education removed.');
  } catch (err) { next(err); }
}

export async function addWorkExperienceHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await addWorkExperience(req.session.userId!, req.body as IWorkExperience);
    successResponse(res, profile, 'Work experience added.', 201);
  } catch (err) { next(err); }
}

export async function removeWorkExperienceHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await removeWorkExperience(req.session.userId!, req.params.expId);
    successResponse(res, profile, 'Work experience removed.');
  } catch (err) { next(err); }
}

export async function saveJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await saveJob(req.session.userId!, req.params.jobId);
    successResponse(res, result, 'Job saved.');
  } catch (err) { next(err); }
}

export async function unsaveJobHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await unsaveJob(req.session.userId!, req.params.jobId);
    successResponse(res, result, 'Job removed from saved list.');
  } catch (err) { next(err); }
}
