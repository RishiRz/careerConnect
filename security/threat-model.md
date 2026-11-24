# CareerConnect — Threat Model

## Assets
- User passwords (Argon2id hashed)
- Session tokens (Redis)
- Resume files (private S3)
- Personal contact information
- Job application data
- Company verification records
- Audit logs

## Threat Actors
- External attackers (credential theft, SQL/NoSQL injection)
- Malicious job seekers (attempting to access other applicants' data)
- Malicious recruiters (attempting to access unauthorized company/job records)
- Scrapers (mass data exfiltration)

## STRIDE Mitigations
- **Spoofing**: HttpOnly, SameSite cookies, session regeneration on login, Redis-backed sessions.
- **Tampering**: Strict Zod input schemas, rejection of unexpected fields, server-side resource ownership validation.
- **Repudiation**: Comprehensive audit logging with actor ID, IP, user-agent, timestamp, and action.
- **Information Disclosure**: Private storage buckets, random storage keys, presigned URLs with 5-minute TTL, safe projections.
- **Denial of Service**: Express rate limiters on general routes, authentication endpoints, and upload endpoints.
- **Elevation of Privilege**: Strict RBAC validation on routes, server-side role retrieval from session.
