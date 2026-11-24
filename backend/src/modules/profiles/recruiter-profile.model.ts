import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecruiterProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  jobTitle?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  linkedinUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const recruiterProfileSchema = new Schema<IRecruiterProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
    jobTitle: { type: String, maxlength: 100 },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    linkedinUrl: { type: String, maxlength: 300 },
  },
  { timestamps: true }
);


recruiterProfileSchema.index({ companyId: 1 });
recruiterProfileSchema.index({ isVerified: 1 });

const RecruiterProfile: Model<IRecruiterProfile> = mongoose.model<IRecruiterProfile>('RecruiterProfile', recruiterProfileSchema);
export default RecruiterProfile;
