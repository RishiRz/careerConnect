import { Request, Response, NextFunction } from 'express';
import {
  uploadResume,
  getMyResumes,
  getResumeDownloadUrl,
  deleteResume,
} from './resumes.service';
import { successResponse } from '../../utils/response';

export async function uploadResumeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }
    const resume = await uploadResume(req.file, req.session.userId!);
    successResponse(res, resume, 'Resume uploaded successfully.', 201);
  } catch (err) { next(err); }
}

export async function getMyResumesHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const resumes = await getMyResumes(req.session.userId!);
    successResponse(res, resumes, 'Resumes retrieved.');
  } catch (err) { next(err); }
}

export async function downloadResumeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const url = await getResumeDownloadUrl(req.params.id, req.session.userId!, req.session.role!);
    successResponse(res, { downloadUrl: url }, 'Download URL generated. Valid for 5 minutes.');
  } catch (err) { next(err); }
}

export async function deleteResumeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await deleteResume(req.params.id, req.session.userId!);
    successResponse(res, null, 'Resume deleted.');
  } catch (err) { next(err); }
}
