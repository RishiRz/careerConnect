import User from '../modules/users/user.model';
import JobSeekerProfile from '../modules/profiles/jobseeker-profile.model';
import RecruiterProfile from '../modules/profiles/recruiter-profile.model';
import Company from '../modules/companies/company.model';
import Job from '../modules/jobs/job.model';
import Application from '../modules/applications/application.model';
import Resume from '../modules/resumes/resume.model';
import Notification from '../modules/notifications/notification.model';
import AuditLog from '../modules/audit/audit.model';
import EmailVerificationToken from '../modules/auth/email-verification-token.model';
import PasswordResetToken from '../modules/auth/password-reset-token.model';
import { logger } from '../utils/logger';

export async function ensureIndexes(): Promise<void> {
  try {
    await Promise.all([
      User.syncIndexes(),
      JobSeekerProfile.syncIndexes(),
      RecruiterProfile.syncIndexes(),
      Company.syncIndexes(),
      Job.syncIndexes(),
      Application.syncIndexes(),
      Resume.syncIndexes(),
      Notification.syncIndexes(),
      AuditLog.syncIndexes(),
      EmailVerificationToken.syncIndexes(),
      PasswordResetToken.syncIndexes(),
    ]);
    logger.info('✅ Database indexes synchronized successfully');
  } catch (error) {
    logger.error('Failed to synchronize database indexes:', { error });
  }
}
