# Database Schema Design

CareerConnect uses MongoDB Atlas with Mongoose ODM models.

## Collections & Schemas

### 1. `users`
- `_id`: ObjectId
- `email`: String (unique, lowercased, indexed)
- `passwordHash`: String (Argon2id, excluded from JSON/default queries)
- `role`: Enum ['jobseeker', 'recruiter', 'admin']
- `firstName`: String
- `lastName`: String
- `phone`: String
- `isEmailVerified`: Boolean
- `accountStatus`: Enum ['active', 'suspended', 'pending_verification']
- `loginAttempts`: Number
- `lockUntil`: Date
- `lastLogin`: Date
- `createdAt`, `updatedAt`: Timestamps

### 2. `jobseekerprofiles`
- `_id`: ObjectId
- `userId`: ObjectId -> User (unique)
- `headline`: String
- `bio`: String
- `location`: String
- `skills`: Array of Strings
- `education`: Array of Subdocuments (institution, degree, fieldOfStudy, dates, grade)
- `workExperience`: Array of Subdocuments (company, title, location, dates, description)
- `linkedinUrl`, `githubUrl`, `portfolioUrl`: String
- `profileVisibility`: Enum ['public', 'private', 'recruiters_only']
- `savedJobs`: Array of ObjectId -> Job

### 3. `recruiterprofiles`
- `_id`: ObjectId
- `userId`: ObjectId -> User (unique)
- `companyId`: ObjectId -> Company
- `jobTitle`: String
- `isVerified`: Boolean
- `verifiedAt`: Date
- `verifiedBy`: ObjectId -> User

### 4. `companies`
- `_id`: ObjectId
- `name`: String
- `slug`: String (unique, indexed)
- `description`, `website`, `industry`, `size`, `location`, `logoKey`: String
- `status`: Enum ['pending', 'verified', 'rejected', 'suspended']
- `createdBy`: ObjectId -> User
- `verifiedAt`: Date
- `verifiedBy`: ObjectId -> User

### 5. `jobs`
- `_id`: ObjectId
- `title`, `description`, `requirements`, `responsibilities`, `location`: String
- `companyId`: ObjectId -> Company
- `postedBy`: ObjectId -> User
- `isRemote`: Boolean
- `jobType`: Enum ['full-time', 'part-time', 'contract', 'internship', 'remote', 'hybrid']
- `experienceLevel`: Enum ['entry', 'mid', 'senior', 'lead', 'executive']
- `salaryMin`, `salaryMax`: Number
- `salaryCurrency`: String
- `skills`: Array of Strings
- `status`: Enum ['draft', 'published', 'paused', 'closed', 'rejected']
- `isInternship`: Boolean
- `internshipDurationMonths`: Number
- `viewCount`, `applicationCount`: Number

### 6. `applications`
- `_id`: ObjectId
- `jobId`: ObjectId -> Job
- `applicantId`: ObjectId -> User
- `resumeId`: ObjectId -> Resume
- `coverLetter`: String
- `status`: Enum ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'offered', 'rejected', 'withdrawn']
- `statusHistory`: Array of events (status, note, changedBy, changedAt)
- `interviewScheduledAt`: Date
- Compound unique index: `{ jobId: 1, applicantId: 1 }`

### 7. `resumes`
- `_id`: ObjectId
- `userId`: ObjectId -> User
- `originalName`: String
- `storageKey`: String
- `mimeType`: String
- `sizeBytes`: Number
- `status`: Enum ['quarantine', 'scanning', 'clean', 'infected', 'failed']
- `isDefault`: Boolean
- `uploadedAt`: Date

### 8. `notifications`
- `_id`: ObjectId
- `userId`: ObjectId -> User
- `type`: Enum ['application_submitted', 'application_status_changed', 'interview_scheduled', 'job_saved', 'account_verified', 'company_verified', 'admin_message', 'general']
- `title`, `message`: String
- `isRead`: Boolean
- `referenceId`: ObjectId
- `referenceType`: String

### 9. `auditlogs`
- `_id`: ObjectId
- `actorId`: ObjectId -> User
- `actorEmail`, `actorRole`: String
- `action`: String
- `targetId`: ObjectId
- `targetType`: String
- `ipAddress`, `userAgent`: String
- `metadata`: Mixed
- `createdAt`: Date
