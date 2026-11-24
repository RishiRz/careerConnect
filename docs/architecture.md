# CareerConnect — Architecture

## System Overview

CareerConnect follows a **modular monolithic** architecture with a clear separation of concerns.

## Component Diagram

```
Browser
  │
  │ HTTPS
  ▼
React SPA (Vite + Tailwind)
  │
  │ /api/v1/* (HttpOnly session cookie)
  ▼
Express.js API (Node.js + TypeScript)
  ├── Security Middleware: Helmet, CORS, Rate Limiter
  ├── Session Middleware: express-session → RedisStore
  ├── Request Validation: Zod strict schemas
  ├── RBAC: authenticate.ts + authorize.ts
  │
  ├── Feature Modules:
  │   ├── auth         (register, login, logout, email verify, password reset)
  │   ├── users        (profile CRUD)
  │   ├── profiles     (job seeker profile, education, experience, saved jobs)
  │   ├── companies    (company CRUD, verification)
  │   ├── jobs         (job posting, search, moderation)
  │   ├── applications (apply, track, status transitions)
  │   ├── resumes      (upload, download, delete)
  │   ├── notifications (read/unread, notifications list)
  │   ├── admin        (user mgmt, company verify, job moderation, audit logs)
  │   └── audit        (structured audit event logging)
  │
  ├── Mongoose ODM ──────────► MongoDB Atlas
  ├── Redis Client ──────────► Managed Redis (sessions)
  └── S3 Client ─────────────► Private S3-compatible Storage (resumes)
```

## Security Architecture

### Authentication Flow
1. User submits credentials over HTTPS.
2. Zod validates email and password (strict schema — rejects objects/operators).
3. User is fetched by email (explicit string query — never `findOne(req.body)`).
4. Argon2id verifies password hash.
5. `session.regenerate()` prevents session fixation.
6. Session stored in Redis with HttpOnly, SameSite=Strict, Secure cookie.

### Authorization Flow
1. `authenticate` middleware: checks `req.session.userId`.
2. `authorize(role)` middleware: checks `req.session.role`.
3. Service layer verifies resource ownership (e.g., recruiter owns the job's company).

### Resume Upload Security
1. Multer file filter: extension + browser MIME type check.
2. `file-type` library: detects actual MIME from file buffer.
3. File signature (magic bytes): validates PDF/DOCX.
4. Random, unguessable S3 key (never original filename).
5. Stored in private bucket.
6. Download via signed URL (5-minute TTL).
