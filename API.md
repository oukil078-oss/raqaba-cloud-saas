# Raqaba API overview

Base path: `/api`

## Public
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /contact`

## Authenticated
All routes below require `Authorization: Bearer <JWT>`.

- `GET /auth/me`, `PATCH /auth/profile`, `POST /auth/logout`
- `/products` CRUD, `GET /products/barcode/:code`, `POST /products/:id/movements`
- `/categories` CRUD
- `/inventory/movements`, `/inventory/low-stock`, `/inventory/valuation`
- `/sales` list/create, `/sales/:id`, `/sales/:id/receipt`, `/sales/:id/cancel`
- `/purchases` list/create
- `/customers` CRUD + profile history
- `/suppliers` CRUD + purchase history
- `/expenses` CRUD
- `/reports/summary`, `/reports/export/sales.csv`
- `/users` staff management
- `/settings` business settings
- `/notifications`, `/audit-logs`

Validation is handled with Zod; persistence is via Prisma/PostgreSQL.
