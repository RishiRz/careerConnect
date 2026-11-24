import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailVerificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const emailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Auto-delete expired tokens
emailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
emailVerificationTokenSchema.index({ userId: 1 });

const EmailVerificationToken: Model<IEmailVerificationToken> = mongoose.model<IEmailVerificationToken>('EmailVerificationToken', emailVerificationTokenSchema);
export default EmailVerificationToken;
