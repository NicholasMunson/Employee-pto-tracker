# Employee Directory + PTO Tracker (Starter)
Generated 2025-09-01 — drop these files into your Next.js app, run:

pnpm add @prisma/client next-auth bcryptjs @tanstack/react-query zod react-hook-form lucide-react
pnpm add -D prisma tsx vitest @types/bcryptjs playwright

cp .env.example .env
pnpm db:push && pnpm db:seed
pnpm dev
