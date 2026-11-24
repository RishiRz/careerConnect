# Production Deployment Guide

## Architecture

| Service | Platform | Details |
|---|---|---|
| Frontend | Vercel | Single-page application, SPA routing, HTTPS |
| Backend | Render / Railway | Node.js Express service, Docker or Native Node |
| Database | MongoDB Atlas | M0/M10 Cluster with TLS & network IP access lists |
| Session Store | Redis Cloud / Upstash | Managed Redis instance with password & TLS |
| File Storage | AWS S3 / Cloudflare R2 | Private bucket, presigned URLs for downloads |

## Step-by-Step Setup

### 1. MongoDB Atlas
1. Create a cluster on MongoDB Atlas.
2. In **Network Access**, add the static IPs of your backend or `0.0.0.0/0` (secured with strong credentials).
3. In **Database Access**, create a dedicated application user with readWrite privileges.
4. Copy the connection string to `MONGODB_URI`.

### 2. Redis Cloud
1. Create an instance on Redis Cloud or Upstash.
2. Set `REDIS_URL=rediss://default:<password>@<host>:<port>`.

### 3. Backend Deployment (Render)
1. Link your GitHub repository.
2. Select Web Service, Root Directory: `backend`.
3. Build command: `npm install && npm run build`.
4. Start command: `node dist/server.js`.
5. Set environment variables from `.env.example`.

### 4. Frontend Deployment (Vercel)
1. Import repository in Vercel.
2. Framework preset: Vite. Root Directory: `frontend`.
3. Set environment variable: `VITE_API_BASE=https://<your-render-backend-url>/api/v1`.
4. Ensure backend `CLIENT_ORIGIN` matches your Vercel production domain.
