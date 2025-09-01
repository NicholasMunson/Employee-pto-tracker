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

## 🗄️ Database

### Push schema to DB
```sh
pnpm db:push
```

### Open Prisma Studio (GUI for data)
```sh
pnpm db:studio
```

### Seed data
```sh
pnpm db:seed
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
