# REST API Documentation

Base URL: `/api/v1`

## 1. Authentication (`/auth`)
- `POST /auth/register` — Register a new user (`jobseeker` or `recruiter`)
- `POST /auth/login` — Sign in and create a Redis session
- `POST /auth/logout` — Invalidate session and clear session cookie
- `GET /auth/me` — Get current authenticated session info
- `POST /auth/verify-email` — Verify email via verification token
- `POST /auth/forgot-password` — Request password reset email
- `POST /auth/reset-password` — Reset password using token

## 2. User & Profiles (`/users`, `/profiles`)
- `GET /users/me` — Get current user profile
- `PATCH /users/me` — Update user name/phone
- `GET /profiles/me` — Get detailed job seeker profile
- `PATCH /profiles/me` — Update bio, headline, skills, visibility
- `POST /profiles/me/education` — Add education record
- `DELETE /profiles/me/education/:educationId` — Delete education record
- `POST /profiles/me/experience` — Add work experience record
- `DELETE /profiles/me/experience/:expId` — Delete work experience record
- `POST /profiles/me/saved-jobs/:jobId` — Save a job
- `DELETE /profiles/me/saved-jobs/:jobId` — Remove a saved job

## 3. Companies (`/companies`)
- `GET /companies` — List verified companies (supports pagination & text search)
- `GET /companies/:id` — Get company details
- `POST /companies` — Create company profile (recruiter only, pending status)
- `PATCH /companies/:id` — Update company profile (owner/admin)

## 4. Jobs (`/jobs`)
- `GET /jobs` — Browse published jobs & internships with filters
- `GET /jobs/:id` — View single job details
- `POST /jobs` — Create job listing (verified recruiter only)
- `PATCH /jobs/:id` — Update job listing
- `PATCH /jobs/:id/status` — Change job status (draft/published/paused/closed)
- `GET /jobs/me/list` — List recruiter's posted jobs

## 5. Applications (`/applications`)
- `POST /applications` — Submit job application
- `GET /applications/me` — List current job seeker's applications
- `GET /applications/:id` — Get application details (applicant or posting recruiter)
- `DELETE /applications/:id` — Withdraw application
- `PATCH /applications/:id/status` — Update applicant status (recruiter only)
- `GET /applications/job/:jobId/applicants` — List applicants for job (recruiter only)

## 6. Resumes (`/resumes`)
- `POST /resumes/upload` — Securely upload PDF/DOCX resume
- `GET /resumes/me` — List uploaded resumes
- `GET /resumes/:id/download` — Generate signed download URL (5-minute expiry)
- `DELETE /resumes/:id` — Delete resume and storage object

## 7. Notifications (`/notifications`)
- `GET /notifications` — List notifications for current user
- `PATCH /notifications/:id/read` — Mark notification as read
- `PATCH /notifications/read-all` — Mark all notifications as read

## 8. Administration (`/admin`)
- `GET /admin/dashboard` — Platform overview metrics
- `GET /admin/users` — Search and manage user accounts
- `PATCH /admin/users/:id/status` — Activate or suspend user
- `GET /admin/companies/pending` — List companies awaiting verification
- `PATCH /admin/companies/:id/verify` — Approve or reject company
- `PATCH /admin/jobs/:id/moderate` — Approve or reject job posting
- `GET /admin/audit-logs` — Query structured system audit logs
