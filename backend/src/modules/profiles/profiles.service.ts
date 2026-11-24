import mongoose from 'mongoose';
import JobSeekerProfile, { IJobSeekerProfile, IEducation, IWorkExperience } from './jobseeker-profile.model';
import { AppError } from '../../middleware/errorHandler';

export async function getJobSeekerProfile(userId: string) {
  const profile = await JobSeekerProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) }).lean().exec();
  if (!profile) throw new AppError('Profile not found.', 404);
  return profile;
}

export async function updateJobSeekerProfile(
  userId: string,
  input: {
    headline?: string;
    bio?: string;
    location?: string;
    skills?: string[];
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    profileVisibility?: 'public' | 'private' | 'recruiters_only';
  }
): Promise<IJobSeekerProfile> {
  const allowed: Record<string, unknown> = {};
  if (typeof input.headline === 'string') allowed.headline = input.headline.trim().substring(0, 200);
  if (typeof input.bio === 'string') allowed.bio = input.bio.trim().substring(0, 2000);
  if (typeof input.location === 'string') allowed.location = input.location.trim().substring(0, 100);
  if (Array.isArray(input.skills)) allowed.skills = input.skills.slice(0, 50).map((s) => String(s).substring(0, 50));
  if (typeof input.linkedinUrl === 'string') allowed.linkedinUrl = input.linkedinUrl.trim().substring(0, 300);
  if (typeof input.githubUrl === 'string') allowed.githubUrl = input.githubUrl.trim().substring(0, 300);
  if (typeof input.portfolioUrl === 'string') allowed.portfolioUrl = input.portfolioUrl.trim().substring(0, 300);
  if (input.profileVisibility) allowed.profileVisibility = input.profileVisibility;

  const updated = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: allowed },
    { new: true, runValidators: true }
  ).exec();

  if (!updated) throw new AppError('Profile not found.', 404);
  return updated;
}

export async function addEducation(userId: string, education: IEducation) {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $push: { education } },
    { new: true, runValidators: true }
  ).exec();
  if (!profile) throw new AppError('Profile not found.', 404);
  return profile;
}

export async function removeEducation(userId: string, educationId: string) {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $pull: { education: { _id: new mongoose.Types.ObjectId(educationId) } } },
    { new: true }
  ).exec();
  if (!profile) throw new AppError('Profile not found.', 404);
  return profile;
}

export async function addWorkExperience(userId: string, exp: IWorkExperience) {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $push: { workExperience: exp } },
    { new: true, runValidators: true }
  ).exec();
  if (!profile) throw new AppError('Profile not found.', 404);
  return profile;
}

export async function removeWorkExperience(userId: string, expId: string) {
  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $pull: { workExperience: { _id: new mongoose.Types.ObjectId(expId) } } },
    { new: true }
  ).exec();
  if (!profile) throw new AppError('Profile not found.', 404);
  return profile;
}

export async function saveJob(userId: string, jobId: string) {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);

  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $addToSet: { savedJobs: new mongoose.Types.ObjectId(jobId) } },
    { new: true }
  ).exec();

  if (!profile) throw new AppError('Profile not found.', 404);
  return { savedJobs: profile.savedJobs };
}

export async function unsaveJob(userId: string, jobId: string) {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);

  const profile = await JobSeekerProfile.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $pull: { savedJobs: new mongoose.Types.ObjectId(jobId) } },
    { new: true }
  ).exec();

  if (!profile) throw new AppError('Profile not found.', 404);
  return { savedJobs: profile.savedJobs };
}
