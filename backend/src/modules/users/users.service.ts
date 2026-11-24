import mongoose from 'mongoose';
import User, { IUser } from './user.model';
import { AppError } from '../../middleware/errorHandler';

export async function getUserProfile(userId: string) {
  if (!mongoose.isValidObjectId(userId)) throw new AppError('Invalid user ID.', 400);

  const user = await User.findById(userId)
    .select('firstName lastName email role accountStatus isEmailVerified createdAt lastLogin')
    .lean()
    .exec();

  if (!user) throw new AppError('User not found.', 404);
  return user;
}

export async function updateUserBasicInfo(
  userId: string,
  input: { firstName?: string; lastName?: string; phone?: string }
): Promise<any> {
  if (!mongoose.isValidObjectId(userId)) throw new AppError('Invalid user ID.', 400);

  const allowedFields: Record<string, unknown> = {};
  if (typeof input.firstName === 'string') allowedFields.firstName = input.firstName.trim().substring(0, 100);
  if (typeof input.lastName === 'string') allowedFields.lastName = input.lastName.trim().substring(0, 100);
  if (typeof input.phone === 'string') allowedFields.phone = input.phone.trim().substring(0, 20);

  const updated = await User.findByIdAndUpdate(
    userId,
    { $set: allowedFields },
    { new: true, runValidators: true }
  )
    .select('firstName lastName email phone role accountStatus')
    .lean()
    .exec();

  if (!updated) throw new AppError('User not found.', 404);
  return updated;
}
