import mongoose from 'mongoose';
import Notification from './notification.model';
import { buildPaginationMeta } from '../../utils/response';

export async function getMyNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Notification.countDocuments(filter),
  ]);

  return { notifications, pagination: buildPaginationMeta(page, limit, total) };
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  if (!mongoose.isValidObjectId(notificationId)) return;

  await Notification.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(notificationId), userId: new mongoose.Types.ObjectId(userId) },
    { $set: { isRead: true } }
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await Notification.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), isRead: false },
    { $set: { isRead: true } }
  );
}
