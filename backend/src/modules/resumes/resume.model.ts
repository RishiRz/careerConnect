import mongoose, { Schema, Document, Model } from 'mongoose';

export type ResumeStatus = 'quarantine' | 'scanning' | 'clean' | 'infected' | 'failed';

export interface IResume extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
  status: ResumeStatus;
  isDefault: boolean;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true, maxlength: 255 },
    storageKey: { type: String, required: true, maxlength: 500 },
    mimeType: { type: String, required: true, maxlength: 100 },
    sizeBytes: { type: Number, required: true, max: 5 * 1024 * 1024 },
    status: { type: String, enum: ['quarantine', 'scanning', 'clean', 'infected', 'failed'], default: 'quarantine' },
    isDefault: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1 });
resumeSchema.index({ status: 1 });

const Resume: Model<IResume> = mongoose.model<IResume>('Resume', resumeSchema);
export default Resume;
