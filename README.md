# Workout Tracker

A simple, mobile-friendly workout tracker. Built with Next.js and deployed on Vercel.

## How it works

Log each exercise as **sets × reps @ weight** on a day. The form is pre-filled
with what you did last time, so at the gym you just adjust and save. Group
exercises into **routines** you tap through (with a ✓ for each one done today),
and see whether you're getting stronger in **stats**.

<table>
  <tr>
    <td><img src="docs/screenshots/routine.png" width="240" alt="A routine with two of five exercises done today"></td>
    <td><img src="docs/screenshots/log-exercise.png" width="240" alt="Logging an exercise, pre-filled from last time"></td>
    <td><img src="docs/screenshots/stats.png" width="240" alt="Strength trend and charts for bench press"></td>
  </tr>
</table>

**[Read the full guide →](docs/how-it-works.md)**

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- Postgres on [Neon](https://neon.com) with [Drizzle ORM](https://orm.drizzle.team)
- Email/password sign-in with [Better Auth](https://www.better-auth.com)
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
npm test           # unit tests (Vitest)
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

### Demo data

```bash
npm run seed-demo
```

Creates `demo@example.com` with about two years of made-up history across 13
exercises, plus three routines (asks for a password to set). Handy for trying the history and stats
screens. Re-running it deletes and re-creates the demo user. It writes to the
database in `.env.local`. Set `DEMO_EMAIL` to use a different address.

### Screenshots

The images in `docs/screenshots/` are taken by driving the app in an
iPhone-sized headless browser, signed in as a freshly seeded demo account:

```bash
npx playwright install chromium   # one time
export DEMO_EMAIL=alex@example.com DEMO_PASSWORD=some-password
npm run seed-demo
npm run screenshots               # with `npm run build && npm start` running in another terminal
```

The script logs two sets for today through the UI, so re-seed before each run.

## Accounts

Sign-up is invite-only: only emails listed in the `ALLOWED_EMAILS` environment
variable (comma-separated) can create an account. If it's unset, nobody can
sign up. Existing users can always sign in.

Environment variables (set in Vercel under **Settings → Environment Variables**,
then `vercel env pull .env.local` to get them locally):

| Variable             | Environments                     | Value                                   |
| -------------------- | -------------------------------- | --------------------------------------- |
| `BETTER_AUTH_SECRET` | Production, Preview, Development | Output of `openssl rand -base64 32`     |
| `ALLOWED_EMAILS`     | Production, Preview, Development | e.g. `you@example.com,friend@example.com` |

`ALLOWED_EMAILS` isn't a secret: save it as a normal (not **Sensitive**) variable so
you can see and edit the list later. After changing it, redeploy for it to take effect.

There's no password reset yet (it needs an email provider).

## Deploying your own copy

1. Fork this repo.
2. In Vercel, **Add New → Project** and import your fork. The defaults work as-is.
3. In the project's **Storage** tab, create a **Neon** Postgres database and connect it
   to all environments (enable branch-per-deployment for **Preview** only).
4. Add `BETTER_AUTH_SECRET` and `ALLOWED_EMAILS` (see [Accounts](#accounts)).
5. Redeploy. Migrations run automatically during the build.
6. Open the site and use **Create account** with an allowed email.

## License

MIT — see [LICENSE](LICENSE).
