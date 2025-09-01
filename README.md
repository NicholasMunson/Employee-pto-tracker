# Employee Directory + PTO Tracker

A simple enterprise-style CRUD app built with Next.js, TypeScript, and Prisma.
Supports role-based views for **Employees**, **Managers**, and **Admins**.

---

## 🚀 Tech Stack
- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** + [shadcn/ui](https://ui.shadcn.com)
- **Prisma ORM** + SQLite (dev) / PostgreSQL (prod)
- **Auth.js (NextAuth)** for authentication + role-based access
- **TanStack Query** for client data fetching
- **Vitest + Playwright** for testing

---

## 📦 Getting Started

### 1. Clone the repo
```sh
git clone https://github.com/<your-username>/employee-pto.git
cd employee-pto
```

### 2. Install dependencies
```sh
pnpm install
```

### 3. Setup environment variables
Copy the example file:
```sh
cp .env.example .env
```
Update values in `.env` (e.g. database URL, NextAuth secret, GitHub OAuth keys if needed).

---

## 🗄️ Database Setup (SQLite for Dev, Postgres for Prod)

This project uses **Prisma** as the ORM. We default to **SQLite** for local development (fast, zero-config), and recommend **PostgreSQL** for production.

### 1) Environment Variables

Create `.env` from the example:
```sh
cp .env.example .env
```

For **SQLite (dev)**:
```env
DATABASE_URL="file:./dev.db"        # or "file:./prisma/dev.db" if you prefer it under /prisma
```

For **PostgreSQL (prod)**:
```env
# Example
DATABASE_URL="postgresql://USER:PASS@HOST:5432/DBNAME?schema=public"
```

> **Note:** Prisma Client is generated to `src/generated/prisma` (see `generator client.output` in `prisma/schema.prisma`).

---

### 2) Initialize Prisma (first time)

Install dependencies:
```sh
pnpm add @prisma/client
pnpm add -D prisma tsx
```

Generate client & create the SQLite DB from the schema:
```sh
pnpm prisma generate
pnpm prisma db push
```

This will create `dev.db` at your project root (or wherever `DATABASE_URL` points).

Open a visual DB GUI:
```sh
pnpm prisma studio
```

---

### 3) Seed Demo Data (Admin/Manager/Employee)

We provide a TypeScript seed script at `prisma/seed.ts`:
```sh
pnpm add bcryptjs @types/bcryptjs -D
pnpm tsx prisma/seed.ts
```

You should see output confirming created users and a PTO policy/balance.

Seeded accounts (for local testing):
- **Admin:** `admin@example.com` / `admin123`
- **Manager:** `manager@example.com` / `manager123`
- **Employee:** `employee@example.com` / `employee123`

> Add a convenience script in `package.json`:
> ```json
> "scripts": {
>   "db:push": "prisma db push",
>   "db:studio": "prisma studio",
>   "db:seed": "tsx prisma/seed.ts"
> }
> ```

---

### 4) Development Workflow

- Change models → regenerate client:
  ```sh
  pnpm prisma generate
  ```
- Update DB schema (non-migratory, fast dev):
  ```sh
  pnpm db:push
  ```
- Inspect/edit data:
  ```sh
  pnpm db:studio
  ```

#### Resetting Dev DB (start fresh)
```sh
rm -f dev.db
pnpm db:push
pnpm db:seed
```
*(Adjust the path if your `DATABASE_URL` points elsewhere.)*

---

### 5) Migrations (optional, for teams or prod)

For a proper migration history:
```sh
pnpm prisma migrate dev --name init
```
This will:
- Create SQL migrations under `prisma/migrations`
- Update your DB
- Regenerate the Prisma client

For production:
```sh
pnpm prisma migrate deploy
```

---

### 6) Switching to Postgres

1. Update `.env` `DATABASE_URL` to your Postgres connection string.
2. Update `datasource db` provider in `prisma/schema.prisma` if needed (`provider = "postgresql"`).
3. Run:
   ```sh
   pnpm prisma generate
   pnpm prisma migrate dev --name init   # for first-time schema on Postgres
   # or pnpm prisma migrate deploy       # for existing migrations
   ```

---

### 7) Common Issues & Fixes

- **`Error: Cannot find module 'bcryptjs'`**
  Install it and rerun:
  ```sh
  pnpm add bcryptjs
  pnpm add -D @types/bcryptjs
  ```

- **`Prisma Client not generated` / types missing**
  ```sh
  pnpm prisma generate
  ```

- **`dev.db` not appearing**
  Run:
  ```sh
  pnpm db:push
  ```
  Ensure `.env` has a valid SQLite path (e.g., `file:./dev.db`).

- **Back-relation errors (P1012) after editing schema**
  Ensure every relation with `fields`/`references` has an opposite field on the related model, then:
  ```sh
  pnpm prisma format
  pnpm prisma generate
  pnpm db:push
  ```

---

### 8) Where is the DB file?

With `DATABASE_URL="file:./dev.db"`, the SQLite database lives at your **project root**.
If you prefer keeping it in the Prisma folder, set:
```env
DATABASE_URL="file:./prisma/dev.db"
```

---

## 💻 Running the App

### Start dev server
```sh
pnpm dev
```
Runs on [http://localhost:3000](http://localhost:3000)

### Build for production
```sh
pnpm build
pnpm start
```

---

## 🧪 Testing

### Unit & integration tests
```sh
pnpm test
```

### E2E tests
```sh
pnpm e2e
```

---

## 🔑 Scripts Reference

| Script           | Description                          |
|------------------|--------------------------------------|
| `pnpm dev`       | Start local dev server               |
| `pnpm build`     | Build app for production             |
| `pnpm start`     | Run production build                 |
| `pnpm lint`      | Run ESLint                           |
| `pnpm db:push`   | Push schema to DB                    |
| `pnpm db:seed`   | Seed database with example data      |
| `pnpm db:studio` | Open Prisma Studio (DB explorer)     |
| `pnpm test`      | Run Vitest tests                     |
| `pnpm e2e`       | Run Playwright end-to-end tests      |

---

## 📂 Project Structure

```
src/
├─ app/              # Next.js routes (App Router)
├─ components/       # Reusable components (UI, forms, etc.)
├─ lib/              # Auth, RBAC, Prisma, helpers
├─ prisma/           # Schema + seeds
└─ styles/           # Global styles
```

---

## 📝 License
MIT — free to use and modify.

---

Generated on 2025-09-01
