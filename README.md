# Geant Electronics Recruitment Platform

Monorepo MVP for **SARL LOTFI ELECTRONICS (Géant Electronics)** recruitment.

## Architecture Overview

- `apps/frontend`: Next.js App Router + TypeScript + Tailwind + shadcn-style UI
- `apps/backend`: NestJS + Prisma + MySQL + JWT cookie auth + RBAC
- Database: MySQL 8
- Mail: Mailhog (local dev)
- Uploads: local volume mounted at `/uploads`

### Core Capabilities

- Public jobs browsing and locale-aware job details
- Apply flow with required authentication
- Candidate dashboard:
  - Profile update
  - CV upload/replace
  - My applications + statuses
- Admin area:
  - Overview analytics
  - Jobs CRUD with EN/FR/AR translations
  - Applications review + status timeline + internal notes + CSV export + secure CV download
  - Services CRUD
  - Users role/active management
  - Settings and email template management

## Frontend i18n + Proxy API

### i18n

- Supported locales: `fr` (default), `en`, `ar`
- Locale-prefixed routes: `/fr`, `/en`, `/ar`
- Middleware redirects `/` to `/fr`
- Language switcher in navbar with flag icons:
  - English: `public/flags/en.svg`
  - French: `public/flags/fr.svg`
  - Arabic: `public/flags/ar.svg`
- Locale persisted in cookie (`NEXT_LOCALE`) and `localStorage`
- Arabic is rendered RTL (`dir="rtl"`)
- Locale metadata with canonical + hreflang alternates
- Locale sitemap entries generated in `app/sitemap.ts`

Translation dictionaries:

- `apps/frontend/messages/fr.json`
- `apps/frontend/messages/en.json`
- `apps/frontend/messages/ar.json`

### Proxy API (SSR-safe)

- Frontend pages/components call relative `/api/*` only
- Proxy route handler: `apps/frontend/app/api/[...path]/route.ts`
- Proxy target env:
  - `INTERNAL_API_BASE_URL` (default: `http://backend:4000/api`)

Why this exists:

- Prevents SSR runtime failures from direct `localhost` backend calls
- Avoids CORS/cookie issues between frontend/backend containers
- Keeps auth cookies same-origin for frontend requests

## Official Company Data Included

- Company: `SARL LOTFI ELECTRONICS (Géant Electronics)`
- Address: `Zone d'activite N°94 LOT 161 Bordj Bou Arreridj, Algérie`
- Website: `https://geant.dz/`
- Contact phone: `(+213)39 260 808 / 909 ; (+213)39 260 000`
- Contact email: `info@geant-dz.com`
- SAV phone: `(+213)35 744 120 ; (+213)35 744 122`
- SAV email: `sav@geant-dz.com`

## Database

Prisma schema location:

- `apps/backend/prisma/schema.prisma`

Initial migration:

- `apps/backend/prisma/migrations/202602090001_init/migration.sql`

Seed script:

- `apps/backend/prisma/seed.ts`

Seeded data includes:

- 1 admin user
- Company settings
- Sample services/departments (HR/DRH, IT/DSI, QHSE, Finance/DFC, Supply Chain, SAV)
- 8 published jobs with EN/FR/AR translations

## Admin Login (Seed)

- Email: `admin@geant.dz`
- Password: `Admin@12345`

Change these credentials immediately in non-dev environments.

## Run With Docker (Recommended)

### 1) Build and start

```bash
docker compose up --build
```

### 2) Services

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:4000/api`
- Backend health: `http://localhost:4000/api/health`
- Mailhog SMTP: `localhost:1025`
- Mailhog UI: `http://localhost:8025`
- MySQL: `localhost:3306`

### 3) Migration + seed behavior

Backend container startup runs:

- `prisma generate`
- `prisma migrate deploy`
- `prisma db seed`
- NestJS app boot

So initial schema/data are applied automatically in Docker dev startup.

## Run Without Docker

### Prerequisites

- Node.js >= 20.11
- MySQL 8 running locally

### 1) Install dependencies

```bash
npm install
```

### 2) Configure env files

- Backend env: copy `apps/backend/.env.example` to `apps/backend/.env`
- Frontend env: copy `apps/frontend/.env.example` to `apps/frontend/.env`

Important backend env:

- `DATABASE_URL=mysql://root:root@mysql:3306/geant_recruitment?charset=utf8mb4`

Important frontend env:

- `INTERNAL_API_BASE_URL=http://localhost:4000/api` (non-Docker local)
- `NEXT_PUBLIC_SITE_URL=http://localhost:3000`

### 3) Generate Prisma client and run migration/seed

```bash
npm run prisma:generate --workspace backend
npm run prisma:migrate:deploy --workspace backend
npm run prisma:seed --workspace backend
```

### 4) Start apps

```bash
npm run dev
```

Or per app:

```bash
npm run dev --workspace backend
npm run dev --workspace frontend
```

## Key Backend API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot`
- `POST /api/auth/reset`

### Public

- `GET /api/jobs`
- `GET /api/jobs/:id`
- `GET /api/services`

### Candidate

- `GET /api/users/me`
- `PATCH /api/users/me`
- `POST /api/users/me/cv`
- `GET /api/users/me/cv`
- `GET /api/users/me/cv/download`
- `GET /api/applications/me`
- `POST /api/applications` (multipart with `cv`)
- `GET /api/applications/:id`
- `GET /api/applications/:id/cv`

### Admin

- `GET /api/admin/analytics`
- `GET/POST/PATCH/DELETE /api/admin/jobs`
- `GET/POST/PATCH/DELETE /api/admin/services`
- `GET /api/admin/applications`
- `GET /api/admin/applications/:id`
- `PATCH /api/admin/applications/:id/status`
- `POST /api/admin/applications/:id/notes`
- `GET /api/admin/applications/:id/cv`
- `GET /api/admin/applications/export`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/disable`
- `GET/PATCH /api/admin/settings`
- `POST /api/admin/settings/templates`

## Security Notes

- JWT access + refresh tokens in HttpOnly cookies
- Refresh token rotation persisted in DB
- RBAC roles: `CANDIDATE`, `HR_MANAGER`, `ADMIN`
- Admin supersedes all roles
- Auth endpoint throttling enabled
- Basic bot protection via honeypot field (`website`)
- CV upload validation:
  - Allowed: PDF/DOC/DOCX
  - Max size: 5MB
- Secure CV download checks for owner/admin roles

## Troubleshooting

### Backend cannot connect to MySQL

- Verify `DATABASE_URL` in `apps/backend/.env`
- Ensure MySQL is reachable and credentials are correct
- In Docker mode, keep host as `mysql` not `localhost`
- Keep `?charset=utf8mb4` in `DATABASE_URL` to preserve Arabic text correctly

### Emails not visible

- Ensure Mailhog is running
- Open `http://localhost:8025`
- Confirm SMTP vars in backend env

### Apply fails with duplicate application

- DB enforces unique `(userId, jobId)` on applications
- Candidate can only apply once per job

### CV upload rejected

- Check file type and size (<= 5MB)
- Use `.pdf`, `.doc`, or `.docx`

### Locale routing unexpected

- Clear browser `NEXT_LOCALE` cookie and localStorage
- Retry via `/fr`, `/en`, or `/ar`

## Build Status

Verified with local build commands:

- `npm run build --workspace backend`
- `npm run build --workspace frontend`
