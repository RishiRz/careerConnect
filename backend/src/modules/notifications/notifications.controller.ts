import { Request, Response, NextFunction } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from './notifications.service';
import { successResponse } from '../../utils/response';

export async function getNotificationsHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const result = await getMyNotifications(req.session.userId!, page, limit);
    successResponse(res, result.notifications, 'Notifications retrieved.', 200, result.pagination);
  } catch (err) { next(err); }
}

export async function markReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await markNotificationRead(req.params.id, req.session.userId!);
    successResponse(res, null, 'Notification marked as read.');
  } catch (err) { next(err); }
}

export async function markAllReadHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await markAllNotificationsRead(req.session.userId!);
    successResponse(res, null, 'All notifications marked as read.');
  } catch (err) { next(err); }
}
