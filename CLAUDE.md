@AGENTS.md

# Workout Tracker — Claude Context

A simple, mobile-friendly workout tracker. Public repo meant to be forkable, so
keep setup steps in the README accurate and avoid anything that only works for
one person's accounts.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS — deployed on Vercel
- Postgres on Neon (added via Vercel Storage), Drizzle ORM
- Node 24 (`.nvmrc`, `engines` in `package.json`), npm

Planned (not yet added): shadcn/ui components, Better Auth (Google sign-in
first), Vitest unit tests, Playwright smoke tests against Vercel deployments.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck    # runs `next typegen` first — generated route types aren't committed
npm run build
npm run db:generate  # schema.ts changes → new SQL migration in drizzle/
npm run db:migrate   # apply migrations to the DB in .env.local
npm run db:studio
```

Local env comes from `vercel env pull .env.local` (git-ignored). It currently
points at the same Neon database as production — be careful with destructive
queries or migrations when running locally.

## Database

- Schema: `src/db/schema.ts`. Tables use snake_case in Postgres, camelCase in
  TS (`casing: "snake_case"` in both the client and `drizzle.config.ts`).
- Always change the schema via `db:generate` and commit the files in `drizzle/`.
  Don't use `drizzle-kit push`.
- Migrations run automatically on every Vercel deploy: the `vercel-build`
  script is `drizzle-kit migrate && next build`. Preview deployments get their
  own Neon branch.
- `drizzle.config.ts` uses `DATABASE_URL_UNPOOLED` (direct connection) for
  migrations; the app uses `DATABASE_URL`.
- Get the client with `getDb()` from `@/db`. It's created lazily on purpose so
  `next build` works without database credentials (CI, forks). Don't create a
  client at module top level.
- `GET /api/health` checks DB connectivity.

## CI

`.github/workflows/ci.yml` runs lint → typecheck → build on PRs and pushes to
`main`, with no secrets. Keep the build working without a database.

## Git

Commit as Ovi Tisler <ovi.tisler@gmail.com> (set in this repo's local git
config; never change global config).
