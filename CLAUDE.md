@AGENTS.md

# Workout Tracker — Claude Context

A simple, mobile-friendly workout tracker. Public repo meant to be forkable, so
keep setup steps in the README accurate and avoid anything that only works for
one person's accounts.

## Stack

- Next.js (App Router) + TypeScript, Tailwind CSS — deployed on Vercel
- Postgres on Neon (added via Vercel Storage), Drizzle ORM
- Better Auth, email/password only (Google may come later)
- Node 24 (`.nvmrc`, `engines` in `package.json`), npm

- Vitest for unit tests of pure logic (e.g. `src/lib/entry-format.test.ts`)

Planned (not yet added): Playwright smoke tests against Vercel deployments.

## Commands

```bash
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck    # runs `next typegen` first — generated route types aren't committed
npm test             # Vitest unit tests (*.test.ts next to the code)
npm run build
npm run db:generate  # schema.ts changes → new SQL migration in drizzle/
npm run db:migrate   # apply migrations to the DB in .env.local
npm run db:studio
npm run seed-demo    # (re)create demo@example.com with ~2 years of fake history
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
- `entries` is the log: one row per "sets × reps @ weight" on a `date`
  (Postgres `date`, the user's local day as "YYYY-MM-DD"; there are no
  times). `sets` NULL means one set; weight is lb. A day can have several
  entries. Always filter by the current user's id.
- `exercises`: built-ins have `user_id` NULL and are visible to everyone;
  custom ones have the creator's `user_id` and are private to them. Use the
  helpers in `src/lib/exercises.ts`, which apply that visibility rule. Names are
  unique ignoring case. Built-ins are seeded by a custom SQL migration
  (`drizzle/0003_seed_exercises.sql`); add more with
  `npx drizzle-kit generate --custom --name <name>`.
- Each exercise has one `muscle_group` (Postgres enum). The list lives in
  `src/lib/muscle-groups.ts` (client-safe, also used by the schema); changing it
  needs a migration.

## App structure

- iOS-style tabbed app. Signed-in routes live in `src/app/(app)/`, whose layout
  adds the bottom `TabBar` (`src/components/tab-bar.tsx`; tabs defined in
  `src/lib/tabs.ts`). Each tab is a stack of URL paths:
  - `/routines` → `/routines/[id]` → `/routines/[id]/[exerciseId]` (log from a
    routine); plus `/routines/new` and `/routines/[id]/edit`
  - `/log` (exercise picker) → `/log/[exerciseId]`
  - `/stats` (exercise picker) → `/stats/[exerciseId]`
  - `/settings`
  `/` redirects to `/routines`.
- Every screen renders `<Screen title back action>` (`src/components/screen.tsx`):
  a sticky top bar with a back link to the parent path (not browser history)
  and the content area. Top and bottom bars pad with `env(safe-area-inset-*)`
  (`viewportFit: "cover"` in the root layout).
- Route folders hold only pages; components and server actions are in
  `src/components/<area>/`.
- Routines (`routines` + `routine_exercises`, ordered by `position`) are named
  lists of exercises. A routine exercise is "done" when it has an entry dated
  today; there's no separate completion state. "Today" is the device's date, so
  anything comparing against it renders client-side (`useLocalToday`).
- Stats math (per-day top set, estimated 1RM, trend fit, ranges, axis ticks)
  is pure and tested in `src/lib/stats.ts`. Charts are hand-rolled SVG
  (`src/components/stats/line-chart.tsx`), no chart library; one series per
  chart, never two y-axes.
- Accent color is blue (`blue-600` / dark `blue-500`) for links, buttons, the
  active tab and chart lines; icons come from `lucide-react`.

## Auth

- Config in `src/lib/auth.ts`. Like `getDb()`, the instance is lazy
  (`getAuth()`) so builds need no secret or database.
- Auth tables (`user`, `session`, `account`, `verification`) live in
  `schema.ts` and are migrated like everything else.
- Server code: `requireUser()` in pages/actions (redirects to `/sign-in`),
  or `getSession()` when signed-out is OK. Sign-in/up/out are server actions in
  `src/app/sign-in/actions.ts`; there's no client-side auth SDK.
- `src/proxy.ts` only does an optimistic cookie check and redirect; it is not
  the security boundary. Pages and actions must call `requireUser()`.
- Sign-up is limited to `ALLOWED_EMAILS` (comma-separated) via a
  `databaseHooks.user.create.before` hook. Unset means no sign-ups.
- Base URL is resolved per request from `localhost:*` and Vercel's
  `VERCEL_URL` / `VERCEL_BRANCH_URL` / `VERCEL_PROJECT_PRODUCTION_URL`, so
  previews work with no URL config. A custom domain that isn't the production
  domain would need adding to `allowedHosts()`.

## CI

`.github/workflows/ci.yml` runs lint → typecheck → unit tests → build on PRs and pushes to
`main`, with no secrets. Keep the build working without a database.

## Git

Commit as Ovi Tisler <ovi.tisler@gmail.com> (set in this repo's local git
config; never change global config).
