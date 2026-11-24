import mongoose, { Schema, Document, Model } from 'mongoose';

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

export interface IApplicationEvent {
  status: ApplicationStatus;
  note?: string;
  changedBy: mongoose.Types.ObjectId;
  changedAt: Date;
}

export interface IApplication extends Document {
  _id: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  resumeId: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: ApplicationStatus;
  statusHistory: IApplicationEvent[];
  interviewScheduledAt?: Date;
  interviewNotes?: string;
  recruiterNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const applicationEventSchema = new Schema<IApplicationEvent>({
  status: { type: String, enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'offered', 'rejected', 'withdrawn'], required: true },
  note: { type: String, maxlength: 1000 },
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'Resume', required: true },
    coverLetter: { type: String, maxlength: 5000 },
    status: { type: String, enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'offered', 'rejected', 'withdrawn'], default: 'submitted' },
    statusHistory: [applicationEventSchema],
    interviewScheduledAt: { type: Date },
    interviewNotes: { type: String, maxlength: 2000 },
    recruiterNotes: { type: String, maxlength: 2000 },
  },
  { timestamps: true }
);

applicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ applicantId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });

const Application: Model<IApplication> = mongoose.model<IApplication>('Application', applicationSchema);
export default Application;
