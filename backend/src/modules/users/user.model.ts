import mongoose, { Schema, Document, Model } from 'mongoose';

export type UserRole = 'jobseeker' | 'recruiter' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  isEmailVerified: boolean;
  accountStatus: AccountStatus;
  loginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['jobseeker', 'recruiter', 'admin'], required: true, default: 'jobseeker' },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, trim: true, maxlength: 20 },
    isEmailVerified: { type: Boolean, default: false },
    accountStatus: { type: String, enum: ['active', 'suspended', 'pending_verification'], default: 'pending_verification' },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).passwordHash;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);


userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });

const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);
export default User;
