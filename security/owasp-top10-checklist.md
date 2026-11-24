# OWASP Top 10:2025 Implementation Checklist

- [x] **A01: Broken Access Control**
  - RBAC implemented (`jobseeker`, `recruiter`, `admin`).
  - Server-side authorization middleware (`authenticate`, `authorize`).
  - IDOR prevented by verifying resource ownership.
  - Deny access by default.

- [x] **A02: Security Misconfiguration**
  - Helmet configured with Content Security Policy and HSTS.
  - Strict CORS allowlist matching `CLIENT_ORIGIN`.
  - Stack traces disabled in production responses.
  - Environment variables separated from codebase.

- [x] **A03: Software Supply Chain Failures**
  - Dependency pinning in package.json.
  - CI workflow configured with `npm audit` and Semgrep scanning.

- [x] **A04: Cryptographic Failures**
  - Argon2id for password hashing.
  - HTTPS enforced in production.
  - SHA-256 for password reset token hashing.
  - Cryptographically secure random tokens (`crypto.randomBytes`).

- [x] **A05: Injection**
  - Zod strict schemas on all API inputs.
  - No raw user input passed to MongoDB queries.
  - Allowlisted search, filter, and sort keys.
  - Validated MongoDB ObjectIds.

- [x] **A06: Insecure Design**
  - Compound unique index on job applications (`jobId` + `applicantId`).
  - Required company verification prior to job postings.
  - Rate limiting on sensitive endpoints.

- [x] **A07: Authentication Failures**
  - Redis-backed server-side sessions.
  - Account lockout after 5 failed attempts.
  - Generic login failure responses to prevent user enumeration.
  - Session rotation on authentication.

- [x] **A08: Software and Data Integrity Failures**
  - Magic byte file signature validation.
  - Content-based MIME detection.
  - Random unguessable storage paths for files.

- [x] **A09: Security Logging and Alerting Failures**
  - Winston structured logging.
  - Audit logging for all authentication, company, and administrative events.
  - Sensitive fields excluded from logs.

- [x] **A10: Mishandling of Exceptional Conditions**
  - Centralized Express error handler.
  - Fail-closed authorization checks.
  - Generic client error responses in production.
