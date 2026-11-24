# Security Test Cases

## 1. NoSQL Injection Test Cases
- **Test 1.1: Login Operator Injection**
  - Payload: `{ "email": { "$ne": null }, "password": "pass" }`
  - Expected: HTTP 400 Bad Request (Zod rejects object for string field).
- **Test 1.2: Query Parameter Injection**
  - Request: `GET /api/v1/jobs?status[$ne]=closed`
  - Expected: HTTP 400 or query sanitization; only published jobs returned.
- **Test 1.3: Mass Assignment Injection**
  - Payload: `{ "firstName": "Hacker", "role": "admin" }` to registration or update endpoint.
  - Expected: HTTP 400 or role ignored; cannot self-promote to admin.

## 2. Authentication Test Cases
- **Test 2.1: Missing Credentials**
  - Request: `POST /api/v1/auth/login` with `{}`.
  - Expected: HTTP 400 Validation Error.
- **Test 2.2: Password Complexity Enforcement**
  - Payload: Weak password (missing symbols/digits/length).
  - Expected: HTTP 400 Validation Error.
- **Test 2.3: Session Fixation Defense**
  - Check: Session ID before and after login.
  - Expected: New session ID issued upon successful login.

## 3. Authorization & IDOR Test Cases
- **Test 3.1: Unauthorized Application View**
  - Request: `GET /api/v1/applications/:id` as another candidate.
  - Expected: HTTP 403 Forbidden.
- **Test 3.2: Unverified Recruiter Job Posting**
  - Request: `POST /api/v1/jobs` with unverified company profile.
  - Expected: HTTP 403 Forbidden.
