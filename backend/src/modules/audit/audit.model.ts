import mongoose, { Schema, Document, Model } from 'mongoose';

export type AuditAction =
  | 'user.register'
  | 'user.login'
  | 'user.login_failed'
  | 'user.logout'
  | 'user.password_reset'
  | 'user.email_verified'
  | 'user.suspended'
  | 'user.activated'
  | 'recruiter.verified'
  | 'company.created'
  | 'company.verified'
  | 'company.rejected'
  | 'job.created'
  | 'job.published'
  | 'job.closed'
  | 'job.moderated'
  | 'application.submitted'
  | 'application.status_changed'
  | 'application.withdrawn'
  | 'resume.uploaded'
  | 'resume.deleted'
  | 'admin.action';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  actorId?: mongoose.Types.ObjectId;
  actorEmail?: string;
  actorRole?: string;
  action: AuditAction;
  targetId?: mongoose.Types.ObjectId;
  targetType?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User' },
    actorEmail: { type: String, maxlength: 254 },
    actorRole: { type: String, maxlength: 50 },
    action: { type: String, required: true, maxlength: 100 },
    targetId: { type: Schema.Types.ObjectId },
    targetType: { type: String, maxlength: 50 },
    ipAddress: { type: String, maxlength: 45 },
    userAgent: { type: String, maxlength: 500 },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ actorId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog: Model<IAuditLog> = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export default AuditLog;
