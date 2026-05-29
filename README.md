# رقابة كلاود — Arabic-first Cloud POS & Inventory SaaS

رقابة كلاود is a production-oriented SaaS platform for Algerian retailers: cloud POS, inventory tracking, sales, purchases, customers, suppliers, expenses, staff permissions, reports, notifications, and audit logs.

## Product scope

- Premium Arabic-first marketing website (RTL) with landing, features, pricing, industries, about, contact, login/register, FAQ, legal pages, and 404.
- Authenticated SaaS dashboard with real CRUD and operational workflows.
- REST API with password hashing, JWT auth, RBAC, validation, audit logging, inventory movements, sales/purchase stock automation, and report endpoints.
- PostgreSQL schema via Prisma with normalized relations and seed data.

## Tech stack

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Framer Motion, custom premium component system.
- **Backend:** Node.js, Express, TypeScript, Zod validation, JWT, Helmet, CORS.
- **Database/Auth:** Appwrite Cloud in production; Prisma/PostgreSQL fallback remains available for local development.
- **Deployment targets:** Vercel (web), Render (API), managed PostgreSQL via `DATABASE_URL`.

## Local setup

```bash
npm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit DATABASE_URL and JWT_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

Frontend: http://localhost:3000  
API: http://localhost:4000/api/health

## Environment variables

### API (`apps/api/.env`)

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
PORT=4000
NODE_ENV=development
UPLOAD_DIR="uploads"
# Appwrite production mode
APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
APPWRITE_PROJECT_ID="your-project-id"
APPWRITE_API_KEY="your-appwrite-api-key"
APPWRITE_DATABASE_ID="raqaba"
APPWRITE_BUCKET_ID="product_images"
```

### Web (`apps/web/.env.local`)

```bash
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
```

## Database

```bash
npm --workspace apps/api run prisma:generate
npm --workspace apps/api run prisma:migrate
npm --workspace apps/api run prisma:seed
```

## Demo credentials after seed

- Owner: `owner@raqaba.dz`
- Manager: `manager@raqaba.dz`
- Cashier: `cashier@raqaba.dz`
- Password for all demo accounts: `DemoPass123!`

## Deployment summary

### API on Render

- Root directory: `apps/api`
- Build command: `npm install && npm run prisma:generate && npm run build`
- Start command: `npm run prisma:migrate:deploy && npm start`
- Required env vars: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `APPWRITE_BUCKET_ID`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `NODE_ENV=production`

### Web on Vercel

- Root directory: `apps/web`
- Build command: `npm run build`
- Required env var: `NEXT_PUBLIC_API_URL=https://YOUR_RENDER_API.onrender.com/api`

## Live URLs

Fill these after deployment:

- Marketing/web app: https://raqaba-cloud-saas.vercel.app
- API health: https://raqaba-api.onrender.com/api/health
- GitHub repository: https://github.com/oukil078-oss/raqaba-cloud-saas

## Security note

Never commit secrets. Use Render/Vercel environment-variable dashboards or Arena secrets. If credentials were pasted into a chat or terminal, rotate them before production use.
