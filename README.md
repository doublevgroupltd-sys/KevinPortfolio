# Premium Portfolio Platform

A production-grade, enterprise-quality personal portfolio application with a luxury public site and a full-featured admin dashboard for managing every piece of content.

**Stack**
- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix UI), Framer Motion, Zustand, React Query
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- **Auth:** JWT in HTTP-only cookies, bcrypt password hashing, CSRF protection, rate limiting
- **Drag-and-drop:** `@dnd-kit` powers reordering for projects, banners, skill categories, and skills within each category in the admin dashboard.
- **Uploads:** Local `/public/uploads` for the demo (swap to S3/Cloudinary by editing `backend/src/middleware/upload.ts` only)
- **Email:** Nodemailer, console-logged in demo mode, ready for real SMTP

---

## 1. Project Structure

```
portfolio/
  backend/
    src/
      server.ts
      routes/        (auth, projects, skills, banners, testimonials, blog, contact, settings)
      models/         (Prisma-backed type helpers / DTOs)
      middleware/     (auth, upload, rateLimiter, errorHandler)
      prisma/
        schema.prisma
        seed.ts
      utils/
    public/uploads/   (uploaded images served statically)
    .env.example
    package.json
    tsconfig.json
  frontend/
    app/              (Next.js App Router pages)
    components/
    store/            (Zustand stores)
    lib/              (API client, utils)
    styles/globals.css
    public/
    .env.local.example
    package.json
README.md
```

---

## 2. Prerequisites

- Node.js 18+
- PostgreSQL 14+ (local install or hosted: Supabase / Neon / Railway / RDS)
- npm or pnpm

---

## 3. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env`:

```
DATABASE_URL="postgresql://user:password@localhost:5432/portfolio?schema=public"
PORT=4000
NODE_ENV=development
JWT_SECRET="change-this-to-a-long-random-string"
JWT_EXPIRES_IN="7d"
COOKIE_NAME="portfolio_token"
CORS_ORIGIN="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"
CONTACT_RECEIVER_EMAIL="you@example.com"
UPLOAD_DIR="public/uploads"
MAX_UPLOAD_MB=2
```

Run database migrations and seed demo data:

```bash
npx prisma migrate dev --name init
npm run seed
```

The seed script creates:
- 1 admin user (from `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Site settings (name, bio, social links, resume placeholder)
- 6 projects (with categories, tech stacks, galleries)
- 15 skills across 4 categories
- 5 testimonials
- 4 promotional banners
- 3 blog posts
- 2 experience/education timeline entries

Start the dev server:

```bash
npm run dev
```

Backend runs at `http://localhost:4000`. Health check: `GET /api/health`.

---

## 4. Frontend Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
```

Edit `.env.local`:

```
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

Run:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## 5. Default Admin Login

Visit `http://localhost:3000/admin/login` and sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `backend/.env` (seeded into the database). Change the password immediately from **Admin → Settings**.

---

## 6. Deployment

### Option A — Vercel (frontend) + Render (backend)

**Backend on Render:**
1. Push this repo to GitHub.
2. Create a new **Web Service** on Render, root directory `backend`.
3. Build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run build`
4. Start command: `npm start`
5. Add a Render **PostgreSQL** instance, copy its connection string into `DATABASE_URL`.
6. Set all other env vars from `.env.example` in the Render dashboard.
7. After first deploy, run `npm run seed` via the Render Shell to seed demo data.

**Frontend on Vercel:**
1. Import the repo, set root directory to `frontend`.
2. Add env var `NEXT_PUBLIC_API_URL` pointing to your Render backend URL + `/api`.
3. Add `NEXT_PUBLIC_SITE_URL` as your Vercel production URL.
4. Deploy. Vercel auto-detects Next.js.

### Option B — DigitalOcean App Platform (both)
1. Create an App from your GitHub repo with two components: `backend` (Node) and `frontend` (Node/Next.js).
2. Add a Managed PostgreSQL database, attach its connection string.
3. Set the same env vars as above on each component.
4. Deploy — DigitalOcean handles HTTPS automatically.

### Option C — AWS
- Backend: Elastic Beanstalk or ECS Fargate behind an ALB; RDS PostgreSQL for the database; S3 for uploads (swap `upload.ts` to the S3 multer-storage driver, instructions inline in that file).
- Frontend: deploy via Amplify Hosting or build static export to S3 + CloudFront (note: API routes require SSR, so prefer Amplify or a Node server on EC2/Fargate).

### Option D — Netlify (frontend) + Railway (backend)
- Railway: new project → deploy from GitHub, root `backend`, attach Railway PostgreSQL plugin, set env vars, deploy.
- Netlify: new site from Git, root `frontend`, build command `next build`, install the official Next.js Netlify plugin, set `NEXT_PUBLIC_API_URL`.

---

## 7. Security Notes

- Cookies are `httpOnly`, `sameSite=strict`, and `secure` in production.
- CSRF token issued on login and required on all mutating admin requests.
- `express-rate-limit` on `/api/auth/login` (5 attempts / 15 min) and `/api/contact` (5 / hour per IP).
- All inputs validated and sanitized with `zod` + `express-validator` style checks and `sanitize-html` for rich text.
- `helmet` sets CSP, HSTS, X-Frame-Options, etc.
- Passwords hashed with `bcrypt` (12 rounds).

---

## 8. Performance & SEO

- Next.js static generation (`generateStaticParams`) for project and blog detail pages, revalidated via `revalidate`.
- `next/image` for automatic WebP, responsive `srcset`, lazy loading, blur placeholders.
- `sitemap.xml` and `robots.txt` generated dynamically in `frontend/app/sitemap.ts` and `robots.ts`.
- Per-page metadata via the Next.js Metadata API (Open Graph + Twitter Cards).
- PWA manifest + offline fallback service worker in `frontend/public/manifest.json` and `frontend/public/sw.js`.

---

## 9. Scripts Reference

**Backend** (`backend/package.json`)
- `npm run dev` — ts-node-dev hot reload
- `npm run build` — compile TypeScript
- `npm start` — run compiled server
- `npm run seed` — seed demo data
- `npx prisma studio` — visual DB browser

**Frontend** (`frontend/package.json`)
- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm start` — serve production build
- `npm run lint` — ESLint

---

## 10. Swapping Local Uploads for Cloud Storage

Local uploads work out of the box for demos. For production, open `backend/src/middleware/upload.ts` — it exports a single `storage` object consumed by all upload routes. Replace the `multer.diskStorage` block with `multer-s3` (AWS) or the Cloudinary multer storage adapter; no route code changes are required.

---

Built as a complete, runnable reference implementation. Continue reading the codebase comments for inline architecture notes.
