import mongoose, { Schema, Document, Model } from 'mongoose';

export type NotificationType =
  | 'application_submitted'
  | 'application_status_changed'
  | 'interview_scheduled'
  | 'job_saved'
  | 'account_verified'
  | 'company_verified'
  | 'admin_message'
  | 'general';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['application_submitted', 'application_status_changed', 'interview_scheduled', 'job_saved', 'account_verified', 'company_verified', 'admin_message', 'general'], required: true },
    title: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, maxlength: 1000 },
    isRead: { type: Boolean, default: false },
    referenceId: { type: Schema.Types.ObjectId },
    referenceType: { type: String, maxlength: 50 },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);
export default Notification;
