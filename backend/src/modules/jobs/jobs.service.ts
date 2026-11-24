import mongoose from 'mongoose';
import Job, { IJob } from './job.model';
import Company from '../companies/company.model';
import AuditLog from '../audit/audit.model';
import { AppError } from '../../middleware/errorHandler';
import { buildPaginationMeta } from '../../utils/response';
import type { CreateJobInput, UpdateJobInput, JobQueryInput } from './jobs.validation';

// Allowed sort fields — prevents injection via sort parameter
const ALLOWED_SORT_FIELDS: Record<string, string> = {
  createdAt: 'createdAt',
  applicationDeadline: 'applicationDeadline',
  title: 'title',
};

export async function createJob(
  input: CreateJobInput,
  recruiterId: string,
  companyId: string
): Promise<IJob> {
  const company = await Company.findById(companyId).lean().exec();
  if (!company) throw new AppError('Company not found.', 404);
  if (company.status !== 'verified') throw new AppError('Company must be verified before posting jobs.', 403);

  const job = await Job.create({
    ...input,
    companyId: new mongoose.Types.ObjectId(companyId),
    postedBy: new mongoose.Types.ObjectId(recruiterId),
    applicationDeadline: input.applicationDeadline ? new Date(input.applicationDeadline) : undefined,
  });

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(recruiterId),
    action: 'job.created',
    targetId: job._id,
    targetType: 'Job',
  });

  return job;
}

export async function getPublishedJobs(query: JobQueryInput) {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = { status: 'published' };

  // Safe field-specific filtering — never spread query directly
  if (typeof query.location === 'string' && query.location.length > 0) {
    filter.location = { $regex: query.location, $options: 'i' };
  }
  if (typeof query.jobType === 'string') {
    filter.jobType = query.jobType;
  }
  if (typeof query.experienceLevel === 'string') {
    filter.experienceLevel = query.experienceLevel;
  }
  if (typeof query.isInternship === 'boolean') {
    filter.isInternship = query.isInternship;
  }
  if (typeof query.companyId === 'string' && mongoose.isValidObjectId(query.companyId)) {
    filter.companyId = new mongoose.Types.ObjectId(query.companyId);
  }

  let mongoQuery: any = Job.find(filter)
    .populate('companyId', 'name slug logoKey location')
    .select('-recruiterNotes');

  if (query.search && query.search.length > 0) {
    mongoQuery = Job.find({ ...filter, $text: { $search: query.search } })
      .populate('companyId', 'name slug logoKey location')
      .select('-recruiterNotes');
  }

  const sortField = ALLOWED_SORT_FIELDS[query.sortBy || 'createdAt'] || 'createdAt';
  const sortDir = query.sortOrder === 'asc' ? 1 : -1;

  const [jobs, total] = await Promise.all([
    mongoQuery.sort({ [sortField]: sortDir }).skip(skip).limit(limit).lean().exec(),
    Job.countDocuments(filter),
  ]);

  return { jobs, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getJobById(jobId: string) {
  if (!mongoose.isValidObjectId(jobId)) {
    throw new AppError('Invalid job ID.', 400);
  }

  const job = await Job.findOne({ _id: jobId, status: 'published' })
    .populate('companyId', 'name slug logoKey location description website industry size')
    .lean()
    .exec();

  if (!job) throw new AppError('Job not found.', 404);

  // Increment view count asynchronously
  Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } }).exec().catch(() => undefined);

  return job;
}

export async function updateJob(
  jobId: string,
  recruiterId: string,
  companyId: string,
  input: UpdateJobInput
): Promise<IJob> {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);

  const job = await Job.findOne({
    _id: new mongoose.Types.ObjectId(jobId),
    postedBy: new mongoose.Types.ObjectId(recruiterId),
    companyId: new mongoose.Types.ObjectId(companyId),
  }).exec();

  if (!job) throw new AppError('Job not found or access denied.', 404);

  if (job.status === 'closed') throw new AppError('Cannot edit a closed job.', 400);

  const allowedUpdate: Partial<IJob> = {};
  const fields: (keyof UpdateJobInput)[] = [
    'title', 'description', 'requirements', 'responsibilities',
    'location', 'isRemote', 'jobType', 'experienceLevel',
    'salaryMin', 'salaryMax', 'salaryCurrency', 'skills',
    'applicationDeadline', 'isInternship', 'internshipDurationMonths',
  ];

  for (const field of fields) {
    if (input[field] !== undefined) {
      (allowedUpdate as Record<string, unknown>)[field] = input[field];
    }
  }

  const updated = await Job.findByIdAndUpdate(
    jobId,
    { $set: allowedUpdate },
    { new: true, runValidators: true }
  ).exec();

  if (!updated) throw new AppError('Job update failed.', 500);
  return updated;
}

export async function getRecruiterJobs(recruiterId: string, companyId: string) {
  return Job.find({
    postedBy: new mongoose.Types.ObjectId(recruiterId),
    companyId: new mongoose.Types.ObjectId(companyId),
  })
    .select('title status jobType experienceLevel location applicationCount viewCount createdAt applicationDeadline')
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}

export async function changeJobStatus(
  jobId: string,
  recruiterId: string,
  companyId: string,
  status: 'draft' | 'published' | 'paused' | 'closed',
  actorRole: string
): Promise<IJob> {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);

  const filter =
    actorRole === 'admin'
      ? { _id: new mongoose.Types.ObjectId(jobId) }
      : {
          _id: new mongoose.Types.ObjectId(jobId),
          postedBy: new mongoose.Types.ObjectId(recruiterId),
          companyId: new mongoose.Types.ObjectId(companyId),
        };

  const updated = await Job.findOneAndUpdate(
    filter,
    { $set: { status } },
    { new: true, runValidators: true }
  ).exec();

  if (!updated) throw new AppError('Job not found or access denied.', 404);

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(recruiterId),
    action: status === 'published' ? 'job.published' : status === 'closed' ? 'job.closed' : 'job.created',
    targetId: updated._id,
    targetType: 'Job',
    metadata: { status },
  });

  return updated;
}
