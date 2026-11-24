import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const passwordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
passwordResetTokenSchema.index({ userId: 1 });

const PasswordResetToken: Model<IPasswordResetToken> = mongoose.model<IPasswordResetToken>('PasswordResetToken', passwordResetTokenSchema);
export default PasswordResetToken;
