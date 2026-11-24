import mongoose, { Schema, Document, Model } from 'mongoose';

export type CompanyStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logoKey?: string;
  status: CompanyStatus;
  createdBy: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 220 },
    description: { type: String, maxlength: 5000 },
    website: { type: String, maxlength: 300 },
    industry: { type: String, maxlength: 100 },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], },
    location: { type: String, maxlength: 100 },
    logoKey: { type: String, maxlength: 500 },
    status: { type: String, enum: ['pending', 'verified', 'rejected', 'suspended'], default: 'pending' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);


companySchema.index({ status: 1 });
companySchema.index({ name: 'text', description: 'text' });

const Company: Model<ICompany> = mongoose.model<ICompany>('Company', companySchema);
export default Company;
