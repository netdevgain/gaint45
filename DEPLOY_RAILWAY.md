# Deploy To Railway (Frontend + Backend + MySQL)

This guide deploys the monorepo to Railway using two app services (`frontend`, `backend`) and one Railway MySQL service.

## 1) Create Railway Project

1. Push this repo to GitHub/GitLab.
2. In Railway, create a new project from that repository.
3. Add services:
   - `MySQL` (Railway template/plugin)
   - `backend` (from repo, Dockerfile)
   - `frontend` (from repo, Dockerfile)

## 2) Backend Service Configuration

In Railway backend service settings:

- Root Directory: `/` (repo root)
- Dockerfile Path: `apps/backend/Dockerfile`
- Build Command: leave empty (Dockerfile handles build)
- Start Command: leave empty (Dockerfile CMD is used)

### Required backend environment variables

Set these in backend service:

- `NODE_ENV=production`
- `PORT` is injected automatically by Railway (do not hardcode)
- `DATABASE_URL=<Railway MySQL DATABASE_URL>`
- `FRONTEND_URL=https://<frontend-domain>`
- `JWT_ACCESS_SECRET=<strong-random-secret>`
- `JWT_REFRESH_SECRET=<strong-random-secret>`
- `RESET_TOKEN_SECRET=<strong-random-secret>`
- `ACCESS_TOKEN_TTL=15m`
- `REFRESH_TOKEN_TTL=7d`
- `RESET_TOKEN_TTL=30m`
- `UPLOAD_DIR=/data/uploads`
- `SEED_ON_DEPLOY=false`
- `SMTP_HOST=<smtp-host>`
- `SMTP_PORT=<smtp-port>`
- `SMTP_SECURE=<true|false>`
- `SMTP_USER=<smtp-user>` (optional)
- `SMTP_PASS=<smtp-pass>` (optional)
- `SMTP_FROM=<no-reply@your-domain>`

### Backend persistent volume

Attach a Railway volume to backend and mount it at `/data`.
`UPLOAD_DIR=/data/uploads` ensures CV files survive restarts/redeploys.

## 3) Frontend Service Configuration

In Railway frontend service settings:

- Root Directory: `/` (repo root)
- Dockerfile Path: `apps/frontend/Dockerfile`
- Build Command: leave empty (Dockerfile handles build)
- Start Command: leave empty (Dockerfile CMD is used)

### Required frontend environment variables

- `NODE_ENV=production`
- `INTERNAL_API_BASE_URL=https://<backend-domain>/api`
- `NEXT_PUBLIC_SITE_URL=https://<frontend-domain>`

## 4) Generate Public Domains

1. Generate backend public domain (example: `https://backend-name.up.railway.app`).
2. Generate frontend public domain (example: `https://frontend-name.up.railway.app`).
3. Update:
   - backend `FRONTEND_URL` to frontend domain
   - frontend `INTERNAL_API_BASE_URL` to backend domain + `/api`
   - frontend `NEXT_PUBLIC_SITE_URL` to frontend domain

## 5) Deploy Order (Important)

1. Deploy `MySQL` service first (wait until healthy).
2. Deploy `backend` second.
3. Deploy `frontend` last.

This order prevents frontend from calling an unavailable backend.

## 6) Migrations and Seed Behavior

- Backend startup now runs `prisma migrate deploy` automatically before NestJS starts.
- Seed is optional:
  - Default: `SEED_ON_DEPLOY=false` (no seed)
  - If needed once: set `SEED_ON_DEPLOY=true`, deploy, then set back to `false`

## 7) Verify Deployment

After deploy:

- Backend health: `https://<backend-domain>/api/health`
- Frontend: `https://<frontend-domain>/fr` (also test `/en`, `/ar`)
- Test auth cookies and apply flow end-to-end.

## 8) Notes

- No localhost URLs are required in production.
- CORS uses `FRONTEND_URL`.
- i18n routes `/fr`, `/en`, `/ar` and RTL Arabic remain unchanged.
