import { Request, Response, NextFunction } from 'express';
import { getUserProfile, updateUserBasicInfo } from './users.service';
import { successResponse } from '../../utils/response';

export async function getMeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await getUserProfile(req.session.userId!);
    successResponse(res, user, 'User profile retrieved.');
  } catch (err) { next(err); }
}

export async function updateMeHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await updateUserBasicInfo(req.session.userId!, req.body);
    successResponse(res, updated, 'Profile updated.');
  } catch (err) { next(err); }
}
