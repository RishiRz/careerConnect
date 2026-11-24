import mongoose, { Schema, Document, Model } from 'mongoose';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'rejected';

export interface IJob extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  companyId: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills: string[];
  applicationDeadline?: Date;
  status: JobStatus;
  rejectionReason?: string;
  moderatedBy?: mongoose.Types.ObjectId;
  viewCount: number;
  applicationCount: number;
  isInternship: boolean;
  internshipDurationMonths?: number;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, required: true, maxlength: 20000 },
    requirements: { type: String, required: true, maxlength: 10000 },
    responsibilities: { type: String, maxlength: 10000 },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: { type: String, required: true, maxlength: 100 },
    isRemote: { type: Boolean, default: false },
    jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid'], required: true },
    experienceLevel: { type: String, enum: ['entry', 'mid', 'senior', 'lead', 'executive'], required: true },
    salaryMin: { type: Number, min: 0 },
    salaryMax: { type: Number, min: 0 },
    salaryCurrency: { type: String, maxlength: 10, default: 'USD' },
    skills: [{ type: String, maxlength: 50 }],
    applicationDeadline: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'paused', 'closed', 'rejected'], default: 'draft' },
    rejectionReason: { type: String, maxlength: 500 },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    isInternship: { type: Boolean, default: false },
    internshipDurationMonths: { type: Number, min: 1, max: 24 },
  },
  { timestamps: true }
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ companyId: 1, status: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ isInternship: 1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

const Job: Model<IJob> = mongoose.model<IJob>('Job', jobSchema);
export default Job;
