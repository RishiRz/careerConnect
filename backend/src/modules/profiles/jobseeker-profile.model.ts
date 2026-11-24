import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEducation {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  grade?: string;
  description?: string;
}

export interface IWorkExperience {
  company: string;
  title: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  isCurrent: boolean;
  description?: string;
}

export interface IJobSeekerProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  headline?: string;
  bio?: string;
  location?: string;
  skills: string[];
  education: IEducation[];
  workExperience: IWorkExperience[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  profileVisibility: 'public' | 'private' | 'recruiters_only';
  savedJobs: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const educationSchema = new Schema<IEducation>({
  institution: { type: String, required: true, maxlength: 200 },
  degree: { type: String, required: true, maxlength: 100 },
  fieldOfStudy: { type: String, required: true, maxlength: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  grade: { type: String, maxlength: 20 },
  description: { type: String, maxlength: 500 },
}, { _id: true });

const workExperienceSchema = new Schema<IWorkExperience>({
  company: { type: String, required: true, maxlength: 200 },
  title: { type: String, required: true, maxlength: 100 },
  location: { type: String, maxlength: 100 },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  isCurrent: { type: Boolean, default: false },
  description: { type: String, maxlength: 2000 },
}, { _id: true });

const jobSeekerProfileSchema = new Schema<IJobSeekerProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    headline: { type: String, maxlength: 200 },
    bio: { type: String, maxlength: 2000 },
    location: { type: String, maxlength: 100 },
    skills: [{ type: String, maxlength: 50 }],
    education: [educationSchema],
    workExperience: [workExperienceSchema],
    linkedinUrl: { type: String, maxlength: 300 },
    githubUrl: { type: String, maxlength: 300 },
    portfolioUrl: { type: String, maxlength: 300 },
    profileVisibility: { type: String, enum: ['public', 'private', 'recruiters_only'], default: 'public' },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
  },
  { timestamps: true }
);


jobSeekerProfileSchema.index({ skills: 1 });

const JobSeekerProfile: Model<IJobSeekerProfile> = mongoose.model<IJobSeekerProfile>('JobSeekerProfile', jobSeekerProfileSchema);
export default JobSeekerProfile;
