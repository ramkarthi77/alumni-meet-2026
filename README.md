# Alumni Meet 2026

**"Reconnect. Celebrate. Cherish Our Memories."**

A production-ready Alumni Meet Registration and Contribution Management System built with Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, and PostgreSQL.

---

## Features

| Feature | Details |
|---|---|
| Public registration | Name, phone (E.164), class/batch, # people, INR contribution |
| Duplicate detection | Phone is the PK; duplicates return a clear message, not a silent overwrite |
| Organizer dashboard | Summary cards, pie chart, batch bar chart — all from live DB |
| Member list | Searchable, sortable, filterable, paginated (20 / 50 / 100) |
| View Details | Full member info in a modal; phone masking with reveal |
| Edit member | Inline edit with confirmation dialog and audit log |
| CSV export | Formula-injection safe; filtered or full export |
| Auth | NextAuth credentials; bcrypt; rate-limited login |
| Security | HTTPS headers, no DB creds in client, server-side auth on all organizer routes |

---

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js (credentials + JWT)
- **Charts**: Recharts
- **Validation**: Zod
- **Tests**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel + Vercel Postgres (or Neon)

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+ (local or Docker)

### 1. Clone and install

```bash
git clone <repo-url>
cd alumni-meet-2026
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/alumni_meet"
DIRECT_URL=""                          # leave blank for local
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="http://localhost:3000"
ORGANIZER_BOOTSTRAP_EMAIL="organizer@example.com"
ORGANIZER_BOOTSTRAP_PASSWORD="YourStrongPassword123!"
ORGANIZER_BOOTSTRAP_NAME="Event Organizer"
```

### 3. Create database

```bash
# If using a fresh local Postgres:
createdb alumni_meet

# Run Prisma migrations
npx prisma migrate deploy

# Seed the first organizer
npm run db:seed
```

> ⚠️ After seeding, remove `ORGANIZER_BOOTSTRAP_*` from your env file or move them out of scope.

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Registration: [http://localhost:3000](http://localhost:3000)
- Organizer login: [http://localhost:3000/organizer/login](http://localhost:3000/organizer/login)
- Dashboard: [http://localhost:3000/organizer/dashboard](http://localhost:3000/organizer/dashboard)

---

## Running Tests

```bash
# Unit + integration tests
npm test

# With coverage
npm run test:coverage

# End-to-end tests (requires running dev server)
npm run test:e2e
```

---

## Deployment to Vercel

### 1. Create a Vercel Postgres database

In your Vercel dashboard → Storage → Create → Postgres.

Copy the `DATABASE_URL` and `DIRECT_URL` from the Vercel dashboard.

### 2. Deploy

```bash
npm install -g vercel
vercel login
vercel --prod
```

### 3. Set environment variables in Vercel

Go to your Vercel project → Settings → Environment Variables. Add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | From Vercel Postgres |
| `DIRECT_URL` | From Vercel Postgres (direct connection URL) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel deployment URL, e.g. `https://alumni-meet-2026.vercel.app` |
| `ORGANIZER_BOOTSTRAP_EMAIL` | organizer email |
| `ORGANIZER_BOOTSTRAP_PASSWORD` | strong password |

### 4. Run migrations and seed

```bash
# Run migrations against production DB
DATABASE_URL="<your-prod-url>" npx prisma migrate deploy

# Seed the first organizer
DATABASE_URL="<your-prod-url>" ORGANIZER_BOOTSTRAP_EMAIL="..." ORGANIZER_BOOTSTRAP_PASSWORD="..." npm run db:seed
```

### 5. Verify

- [ ] Public registration form loads
- [ ] Register a test member — see success page
- [ ] Organizer login works
- [ ] Dashboard shows correct counts and charts
- [ ] Member list shows the test member
- [ ] View Details opens the modal
- [ ] Edit member saves changes
- [ ] CSV export downloads correctly
- [ ] Unauthenticated API calls to `/api/members` return 401
- [ ] Mobile view looks correct

---

## Alternative: AWS / Docker deployment

```bash
# Build Docker image (add a Dockerfile — see below)
docker build -t alumni-meet-2026 .

# Run with Docker Compose (requires a postgres service)
docker-compose up
```

Provide a `Dockerfile` (Node 18 slim base, build step, start `next start`) and `docker-compose.yml` with `postgres:15` service and correct env vars.

---

## Security Checklist

- [x] Passwords hashed with bcrypt (cost factor 12)
- [x] JWT sessions with 8-hour expiry
- [x] HttpOnly + Secure session cookies in production
- [x] Server-side auth check on all organizer API routes
- [x] Middleware re-checks auth for organizer pages
- [x] Rate limiting on registration (10/15 min) and login (5/15 min)
- [x] No DB credentials in client-side code
- [x] Zod validation on every API input
- [x] Prisma parameterized queries (no raw SQL injection risk)
- [x] CSV formula injection prevention
- [x] Phone number normalised before storage
- [x] Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)
- [x] `.env.local` in `.gitignore`
- [x] No organizer bootstrap endpoint accessible after seeding

---

## Custom Domain

In Vercel → Project Settings → Domains → Add your domain.

For a short URL use a domain registrar shortlink service (e.g. Bitly custom domain) pointing to your Vercel URL.

---

## Prisma Studio (DB GUI)

```bash
npm run db:studio
```

---

## Environment Variables Reference

See `.env.example` for the full list with comments.
