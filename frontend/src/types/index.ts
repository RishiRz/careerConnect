export type UserRole = 'jobseeker' | 'recruiter' | 'admin';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  accountStatus: string;
  isEmailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface Company {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  location?: string;
  logoKey?: string;
  status: string;
  createdAt: string;
}

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote' | 'hybrid';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed' | 'rejected';

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string;
  responsibilities?: string;
  companyId: Company | string;
  location: string;
  isRemote: boolean;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  skills: string[];
  applicationDeadline?: string;
  status: JobStatus;
  viewCount: number;
  applicationCount: number;
  isInternship: boolean;
  internshipDurationMonths?: number;
  createdAt: string;
}

export type ApplicationStatus =
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'offered'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  _id: string;
  jobId: Job | any;
  applicantId: string | any;
  resumeId: string | any;
  coverLetter?: string;
  status: ApplicationStatus;
  statusHistory: { status: ApplicationStatus; note?: string; changedAt: string }[];
  interviewScheduledAt?: string;
  createdAt: string;
}

export interface Resume {
  _id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  status: string;
  isDefault: boolean;
  uploadedAt: string;
}

export interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
