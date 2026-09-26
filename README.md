# Workout Tracker

A simple, mobile-friendly workout tracker. Built with Next.js and deployed on Vercel.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- Postgres on [Neon](https://neon.com) with [Drizzle ORM](https://orm.drizzle.team)
- Hosted on [Vercel](https://vercel.com)

## Running locally

Requires Node.js 24 (see `.nvmrc`).

```bash
npm install
vercel link                  # connect to your Vercel project (one time)
vercel env pull .env.local   # download DATABASE_URL etc.
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run lint       # ESLint
npm run typecheck  # TypeScript type check
npm run build      # production build
```

## Database

Tables are defined in `src/db/schema.ts`. To change them:

```bash
npm run db:generate   # write a SQL migration into drizzle/ from schema changes
npm run db:migrate    # apply pending migrations to the database in .env.local
npm run db:studio     # browse the database in your browser
```

Commit the generated files in `drizzle/`. Vercel runs pending migrations
automatically on every deploy (see the `vercel-build` script), so previews and
production stay in sync with the schema.

`GET /api/health` returns `{"ok":true,"db":"up"}` when the app can reach the database.

## Deploying your own copy

1. Fork this repo.
2. In Vercel, **Add New → Project** and import your fork. The defaults work as-is.
3. In the project's **Storage** tab, create a **Neon** Postgres database and connect it
   to all environments (enable branch-per-deployment for **Preview** only).
4. Redeploy. Migrations run automatically during the build.

## License

MIT — see [LICENSE](LICENSE).
