# Security Requirements

1. **Authentication & Session Management**
   - Passwords must be hashed using Argon2id.
   - Sessions must be stored server-side in Redis.
   - Cookies must have `httpOnly: true`, `sameSite: strict` (in production), and `secure: true` (in production).
   - Session identifiers must be regenerated upon successful login to prevent fixation attacks.
   - Account lockout must trigger after 5 consecutive failed attempts.

2. **Authorization & Access Control**
   - Principle of Least Privilege: Every endpoint must deny access by default unless authorized.
   - Verify ownership of resources before reading, modifying, or deleting them.
   - Never expose internal system details or database stack traces in client errors.

3. **Input Validation & Injection Prevention**
   - Every incoming request must be validated with Zod schemas configured with `.strict()`.
   - Never pass raw `req.body`, `req.query`, or `req.params` into MongoDB queries.
   - Allowlist filter and sort parameters.
   - Validate MongoDB ObjectIds prior to query execution.

4. **File Upload Security**
   - Maximum upload size of 5 MB.
   - Only `.pdf` and `.docx` extensions allowed.
   - Verify magic byte signatures in memory before uploading to cloud storage.
   - Store files using unguessable random keys.
