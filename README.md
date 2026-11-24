# CareerConnect

**A production-oriented Job & Internship Portal built with the MERN Stack.**

Secure, role-based platform connecting **Job Seekers**, **Recruiters**, and **Administrators**.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB Atlas + Mongoose |
| Auth | Redis-backed sessions, Argon2id, HttpOnly cookies |
| File Storage | Private S3-compatible object storage |
| Security | OWASP Top 10:2025, Helmet, CORS, Rate limiting, Zod validation |
| Testing | Jest, Supertest, Playwright |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas, Managed Redis |

---

## 🏗️ Architecture

```
Browser (React SPA)
        │  HTTPS
        ▼
Express.js API (TypeScript)
   ├── Helmet, CORS, Rate Limiter
   ├── Redis-backed Session Store
   ├── Zod Validation Middleware
   ├── RBAC Authorization
   └── Mongoose ODM
        ├── MongoDB Atlas
        ├── Redis (Sessions)
        └── S3-compatible Storage (Resumes)
```

---

## 📁 Project Structure

```
CareerConnect/
├── frontend/        # React + Vite + Tailwind
├── backend/         # Express + TypeScript API
│   └── src/
│       ├── modules/ # Feature modules (auth, jobs, companies, etc.)
│       ├── middleware/
│       ├── config/
│       └── utils/
├── security/        # Threat model, OWASP checklist
├── docs/            # Architecture, API, deployment docs
└── .github/         # CI/CD workflows
```

---

## 🔐 Security Features (OWASP Top 10:2025)

- **A01 Broken Access Control** — RBAC, resource ownership checks, deny-by-default
- **A02 Security Misconfiguration** — Helmet.js, CSP, HSTS, restricted CORS
- **A03 Supply Chain** — npm audit, Dependabot, Trivy, SBOM
- **A04 Cryptographic Failures** — Argon2id, HTTPS-only, secure sessions
- **A05 Injection** — Zod strict schemas, no raw query passthrough, ObjectId validation
- **A06 Insecure Design** — Threat model, duplicate-application prevention, status FSM
- **A07 Auth Failures** — Session rotation, account lockout, secure cookies, MFA-ready
- **A08 Integrity Failures** — File signature validation, secure upload pipeline
- **A09 Logging Gaps** — Structured audit logs (Winston), never logs secrets
- **A10 Exceptional Conditions** — Centralized error handler, fail-closed auth

---

## ⚡ Quick Start (Local Dev)

### Prerequisites
- Node.js 20+ LTS
- MongoDB Atlas account (free tier) or local MongoDB
- Redis (Docker or local instance)

### 1. Clone & install

```powershell
git clone https://github.com/yourname/CareerConnect.git
Set-Location CareerConnect

# Backend
Set-Location backend
Copy-Item ..\.env.example .env
npm install
npm run dev

# Frontend (in another terminal)
Set-Location ..\frontend
npm install
npm run dev
```

### 2. Access the app
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

---

## 🧪 Running Tests

```powershell
Set-Location backend
npm test                    # All tests
npm run test:security       # Security-focused tests only
```

---

## 📜 License

MIT
