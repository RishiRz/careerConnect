import mongoose from 'mongoose';
import Application, { ApplicationStatus } from './application.model';
import Job from '../jobs/job.model';
import Resume from '../resumes/resume.model';
import Notification from '../notifications/notification.model';
import AuditLog from '../audit/audit.model';
import RecruiterProfile from '../profiles/recruiter-profile.model';
import { AppError } from '../../middleware/errorHandler';
import { buildPaginationMeta } from '../../utils/response';
import type { SubmitApplicationInput, UpdateApplicationStatusInput } from './applications.validation';

export async function submitApplication(input: SubmitApplicationInput, applicantId: string) {
  const { jobId, resumeId, coverLetter } = input;

  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);
  if (!mongoose.isValidObjectId(resumeId)) throw new AppError('Invalid resume ID.', 400);

  const [job, resume, existing] = await Promise.all([
    Job.findById(jobId).lean().exec(),
    Resume.findOne({ _id: resumeId, userId: new mongoose.Types.ObjectId(applicantId) }).lean().exec(),
    Application.findOne({
      jobId: new mongoose.Types.ObjectId(jobId),
      applicantId: new mongoose.Types.ObjectId(applicantId),
    }).lean().exec(),
  ]);

  if (!job || job.status !== 'published') throw new AppError('Job not found or not accepting applications.', 404);
  if (!resume || resume.status !== 'clean') throw new AppError('Resume not found or not ready. Only clean resumes can be submitted.', 400);
  if (existing) throw new AppError('You have already applied for this job.', 409);

  const application = await Application.create({
    jobId: new mongoose.Types.ObjectId(jobId),
    applicantId: new mongoose.Types.ObjectId(applicantId),
    resumeId: new mongoose.Types.ObjectId(resumeId),
    coverLetter,
    status: 'submitted',
    statusHistory: [{
      status: 'submitted',
      changedBy: new mongoose.Types.ObjectId(applicantId),
      changedAt: new Date(),
    }],
  });

  // Update job application count
  await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

  // Create notification
  await Notification.create({
    userId: new mongoose.Types.ObjectId(applicantId),
    type: 'application_submitted',
    title: 'Application Submitted',
    message: `Your application for "${job.title}" has been submitted successfully.`,
    referenceId: application._id,
    referenceType: 'Application',
  });

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(applicantId),
    action: 'application.submitted',
    targetId: application._id,
    targetType: 'Application',
    metadata: { jobId, jobTitle: job.title },
  });

  return application;
}

export async function getMyApplications(applicantId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const filter = { applicantId: new mongoose.Types.ObjectId(applicantId) };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('jobId', 'title location jobType companyId')
      .populate({ path: 'jobId', populate: { path: 'companyId', select: 'name logoKey' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Application.countDocuments(filter),
  ]);

  return { applications, pagination: buildPaginationMeta(page, limit, total) };
}

export async function getApplicationById(applicationId: string, requesterId: string, requesterRole: string) {
  if (!mongoose.isValidObjectId(applicationId)) throw new AppError('Invalid application ID.', 400);

  const application = await Application.findById(applicationId)
    .populate('jobId', 'title location companyId')
    .populate('resumeId', 'originalName status')
    .lean()
    .exec();

  if (!application) throw new AppError('Application not found.', 404);

  // Authorization: only the applicant or the recruiter who posted the job can view
  if (requesterRole === 'jobseeker') {
    if (application.applicantId.toString() !== requesterId) {
      throw new AppError('Access denied.', 403);
    }
  } else if (requesterRole === 'recruiter') {
    const profile = await RecruiterProfile.findOne({ userId: requesterId }).lean().exec();
    const job = await Job.findById(application.jobId).lean().exec();
    if (!job || !profile || job.companyId.toString() !== profile.companyId?.toString()) {
      throw new AppError('Access denied.', 403);
    }
  }

  return application;
}

export async function withdrawApplication(applicationId: string, applicantId: string) {
  if (!mongoose.isValidObjectId(applicationId)) throw new AppError('Invalid application ID.', 400);

  const application = await Application.findOne({
    _id: new mongoose.Types.ObjectId(applicationId),
    applicantId: new mongoose.Types.ObjectId(applicantId),
  }).exec();

  if (!application) throw new AppError('Application not found.', 404);

  const nonWithdrawableStatuses: ApplicationStatus[] = ['offered', 'rejected', 'withdrawn'];
  if (nonWithdrawableStatuses.includes(application.status)) {
    throw new AppError(`Cannot withdraw an application with status: ${application.status}`, 400);
  }

  application.status = 'withdrawn';
  application.statusHistory.push({
    status: 'withdrawn',
    changedBy: new mongoose.Types.ObjectId(applicantId),
    changedAt: new Date(),
  });
  await application.save();

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(applicantId),
    action: 'application.withdrawn',
    targetId: application._id,
    targetType: 'Application',
  });

  return application;
}

export async function updateApplicationStatus(
  applicationId: string,
  recruiterId: string,
  companyId: string,
  input: UpdateApplicationStatusInput
) {
  if (!mongoose.isValidObjectId(applicationId)) throw new AppError('Invalid application ID.', 400);

  const application = await Application.findById(applicationId).exec();
  if (!application) throw new AppError('Application not found.', 404);

  // Verify recruiter owns the company that posted this job
  const job = await Job.findById(application.jobId).lean().exec();
  if (!job || job.companyId.toString() !== companyId) {
    throw new AppError('Access denied.', 403);
  }

  application.status = input.status as ApplicationStatus;
  application.statusHistory.push({
    status: input.status as ApplicationStatus,
    note: input.note,
    changedBy: new mongoose.Types.ObjectId(recruiterId),
    changedAt: new Date(),
  });

  if (input.interviewScheduledAt && input.status === 'interview_scheduled') {
    application.interviewScheduledAt = new Date(input.interviewScheduledAt);
  }

  await application.save();

  // Notify applicant
  await Notification.create({
    userId: application.applicantId,
    type: 'application_status_changed',
    title: 'Application Status Updated',
    message: `Your application status has been updated to: ${input.status.replace(/_/g, ' ')}.`,
    referenceId: application._id,
    referenceType: 'Application',
  });

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(recruiterId),
    action: 'application.status_changed',
    targetId: application._id,
    targetType: 'Application',
    metadata: { status: input.status },
  });

  return application;
}

export async function getJobApplicants(jobId: string, recruiterId: string, companyId: string, page = 1, limit = 20) {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);

  // Verify ownership
  const job = await Job.findOne({
    _id: new mongoose.Types.ObjectId(jobId),
    companyId: new mongoose.Types.ObjectId(companyId),
  }).lean().exec();

  if (!job) throw new AppError('Job not found or access denied.', 404);

  const skip = (page - 1) * limit;
  const filter = { jobId: new mongoose.Types.ObjectId(jobId) };

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .populate('applicantId', 'firstName lastName email')
      .populate('resumeId', 'originalName status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Application.countDocuments(filter),
  ]);

  return { applications, pagination: buildPaginationMeta(page, limit, total) };
}
