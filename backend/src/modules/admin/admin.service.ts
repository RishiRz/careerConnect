import mongoose from 'mongoose';
import User from '../users/user.model';
import Company from '../companies/company.model';
import Job from '../jobs/job.model';
import Application from '../applications/application.model';
import AuditLog from '../audit/audit.model';
import RecruiterProfile from '../profiles/recruiter-profile.model';
import Notification from '../notifications/notification.model';
import { AppError } from '../../middleware/errorHandler';
import { buildPaginationMeta } from '../../utils/response';

export async function adminGetUsers(page = 1, limit = 20, search?: string) {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  if (search && search.length > 0) {
    const safeSearch = search.substring(0, 100);
    filter.$or = [
      { email: { $regex: safeSearch, $options: 'i' } },
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('firstName lastName email role accountStatus isEmailVerified createdAt lastLogin')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    User.countDocuments(filter),
  ]);

  return { users, pagination: buildPaginationMeta(page, limit, total) };
}

export async function adminChangeUserStatus(
  targetUserId: string,
  status: 'active' | 'suspended',
  adminId: string
) {
  if (!mongoose.isValidObjectId(targetUserId)) throw new AppError('Invalid user ID.', 400);

  const target = await User.findById(targetUserId).exec();
  if (!target) throw new AppError('User not found.', 404);
  if (target.role === 'admin') throw new AppError('Cannot change status of admin users.', 403);

  target.accountStatus = status;
  await target.save();

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(adminId),
    actorRole: 'admin',
    action: status === 'suspended' ? 'user.suspended' : 'user.activated',
    targetId: target._id,
    targetType: 'User',
    metadata: { status },
  });

  await Notification.create({
    userId: target._id,
    type: 'admin_message',
    title: status === 'suspended' ? 'Account Suspended' : 'Account Activated',
    message:
      status === 'suspended'
        ? 'Your account has been suspended. Contact support for more information.'
        : 'Your account has been activated.',
  });

  return target;
}

export async function adminGetPendingCompanies(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const filter = { status: 'pending' };

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    Company.countDocuments(filter),
  ]);

  return { companies, pagination: buildPaginationMeta(page, limit, total) };
}

export async function adminVerifyCompany(
  companyId: string,
  adminId: string,
  approve: boolean,
  rejectionReason?: string
) {
  if (!mongoose.isValidObjectId(companyId)) throw new AppError('Invalid company ID.', 400);

  const company = await Company.findById(companyId).exec();
  if (!company) throw new AppError('Company not found.', 404);
  if (company.status !== 'pending') throw new AppError('Company is not in pending status.', 400);

  company.status = approve ? 'verified' : 'rejected';
  if (approve) {
    company.verifiedAt = new Date();
    company.verifiedBy = new mongoose.Types.ObjectId(adminId);
  }
  if (!approve && rejectionReason) {
    company.rejectionReason = rejectionReason.substring(0, 500);
  }
  await company.save();

  if (approve) {
    await RecruiterProfile.findOneAndUpdate(
      { companyId: company._id },
      { $set: { isVerified: true, verifiedAt: new Date(), verifiedBy: new mongoose.Types.ObjectId(adminId) } }
    );
  }

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(adminId),
    actorRole: 'admin',
    action: 'company.verified',
    targetId: company._id,
    targetType: 'Company',
    metadata: { approved: approve, rejectionReason },
  });

  await Notification.create({
    userId: company.createdBy,
    type: 'company_verified',
    title: approve ? 'Company Verified' : 'Company Verification Rejected',
    message: approve
      ? `Your company "${company.name}" has been verified. You can now post jobs.`
      : `Your company "${company.name}" verification was rejected. Reason: ${rejectionReason || 'Not specified'}`,
    referenceId: company._id,
    referenceType: 'Company',
  });

  return company;
}

export async function adminModerateJob(
  jobId: string,
  adminId: string,
  approve: boolean,
  rejectionReason?: string
) {
  if (!mongoose.isValidObjectId(jobId)) throw new AppError('Invalid job ID.', 400);

  const job = await Job.findById(jobId).exec();
  if (!job) throw new AppError('Job not found.', 404);

  if (!approve) {
    job.status = 'rejected';
    if (rejectionReason) job.rejectionReason = rejectionReason.substring(0, 500);
    job.moderatedBy = new mongoose.Types.ObjectId(adminId);
  } else {
    job.moderatedBy = new mongoose.Types.ObjectId(adminId);
  }

  await job.save();

  await AuditLog.create({
    actorId: new mongoose.Types.ObjectId(adminId),
    actorRole: 'admin',
    action: 'job.moderated',
    targetId: job._id,
    targetType: 'Job',
    metadata: { approved: approve, rejectionReason },
  });

  return job;
}

export async function adminGetAuditLogs(page = 1, limit = 50, action?: string) {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {};

  const allowedActions = [
    'user.register', 'user.login', 'user.login_failed', 'user.logout',
    'user.password_reset', 'user.email_verified', 'user.suspended', 'user.activated',
    'recruiter.verified', 'company.created', 'company.verified', 'company.rejected',
    'job.created', 'job.published', 'job.closed', 'job.moderated',
    'application.submitted', 'application.status_changed', 'application.withdrawn',
    'resume.uploaded', 'resume.deleted', 'admin.action',
  ];

  if (typeof action === 'string' && allowedActions.includes(action)) {
    filter.action = action;
  }

  const [logs, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec(),
    AuditLog.countDocuments(filter),
  ]);

  return { logs, pagination: buildPaginationMeta(page, limit, total) };
}

export async function adminGetPlatformStats() {
  const [
    totalUsers,
    totalJobs,
    totalApplications,
    pendingCompanies,
    activeUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments({ status: 'published' }),
    Application.countDocuments(),
    Company.countDocuments({ status: 'pending' }),
    User.countDocuments({ accountStatus: 'active' }),
  ]);

  return {
    totalUsers,
    totalJobs,
    totalApplications,
    pendingCompanies,
    activeUsers,
  };
}
