// Creates (or re-creates) a demo user with ~2 years of made-up training
// history, for trying the app with lots of data.
//
//   npm run seed-demo
//
// Writes to the database in .env.local (or DATABASE_URL). Deletes any existing
// demo user and all their data first. The password comes from DEMO_PASSWORD or
// is asked for; it's never stored in the repo.

import { existsSync } from "node:fs";
import { createInterface } from "node:readline";

import { generateRandomString, hashPassword } from "better-auth/crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";

import { getDb } from "../src/db";
import { account, entries, exercises, user } from "../src/db/schema";
import { localToday } from "../src/lib/entry-format";

// getDb() reads DATABASE_URL on first use, so loading it here is early enough.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const EMAIL = "demo@example.com";
const DAYS = 730;

type Pattern = "steady" | "plateau" | "decline";

type Plan = {
  name: string; // must match a built-in exercise
  day: 1 | 3 | 5; // Mon, Wed, Fri
  start: number;
  end: number;
  step: number; // weight increments
  reps: [number, number];
  sets: number | null;
  pattern: Pattern;
};

const PLANS: Plan[] = [
  { name: "Bench Press", day: 1, start: 135, end: 205, step: 5, reps: [5, 8], sets: 3, pattern: "steady" },
  { name: "Overhead Press", day: 1, start: 85, end: 115, step: 5, reps: [5, 8], sets: 3, pattern: "plateau" },
  { name: "Triceps Pushdown", day: 1, start: 40, end: 70, step: 5, reps: [10, 12], sets: 3, pattern: "steady" },
  { name: "Lateral Raise", day: 1, start: 15, end: 25, step: 2.5, reps: [12, 15], sets: 3, pattern: "steady" },
  { name: "Squat", day: 3, start: 155, end: 255, step: 5, reps: [5, 8], sets: 3, pattern: "steady" },
  { name: "Romanian Deadlift", day: 3, start: 135, end: 205, step: 5, reps: [8, 10], sets: 3, pattern: "steady" },
  { name: "Leg Press", day: 3, start: 270, end: 450, step: 10, reps: [10, 12], sets: 3, pattern: "steady" },
  { name: "Standing Calf Raise", day: 3, start: 100, end: 160, step: 10, reps: [12, 15], sets: 3, pattern: "plateau" },
  { name: "Deadlift", day: 5, start: 185, end: 315, step: 5, reps: [3, 5], sets: null, pattern: "steady" },
  { name: "Barbell Row", day: 5, start: 115, end: 165, step: 5, reps: [6, 10], sets: 3, pattern: "steady" },
  { name: "Lat Pulldown", day: 5, start: 100, end: 150, step: 5, reps: [8, 12], sets: 3, pattern: "steady" },
  { name: "Incline Dumbbell Press", day: 5, start: 40, end: 65, step: 5, reps: [8, 10], sets: 3, pattern: "steady" },
  { name: "Barbell Curl", day: 5, start: 60, end: 80, step: 5, reps: [8, 12], sets: 3, pattern: "decline" },
];

// Two vacations with no training, then a few weeks of being a bit weaker.
const BREAKS: [number, number][] = [
  [200, 217],
  [480, 500],
];

// Deterministic randomness, so every run produces the same history.
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const random = mulberry32(42);
const between = (lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));

// Progress from 0 to 1 over the whole period, shaped by the pattern.
function progress(pattern: Pattern, t: number) {
  switch (pattern) {
    case "steady":
      return 1 - (1 - t) ** 1.6;
    case "plateau":
      return Math.min(1, 1 - (1 - Math.min(t / 0.5, 1)) ** 2);
    case "decline":
      return t < 0.7 ? 1 - (1 - t / 0.7) ** 2 : 1 - (t - 0.7) * 2;
  }
}

function detraining(day: number) {
  for (const [, end] of BREAKS) {
    const since = day - end;
    if (since >= 0 && since < 21) return 0.9 + (0.1 * since) / 21;
  }
  return 1;
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type NewEntry = { name: string; date: string; sets: number | null; reps: number; weight: number };

function generate(today: string) {
  const first = addDays(today, -DAYS);
  const rows: NewEntry[] = [];

  for (let day = 0; day <= DAYS; day++) {
    const date = addDays(first, day);
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (![1, 3, 5].includes(weekday)) continue;
    if (BREAKS.some(([start, end]) => day >= start && day < end)) continue;
    if (random() < 0.08) continue; // skipped a session

    // A lighter week every 8 weeks, counted back from today so the most
    // recent week is a normal one.
    const weeksAgo = Math.floor((DAYS - day) / 7);
    const deload = weeksAgo % 8 === 4 ? 0.85 : 1;

    for (const plan of PLANS.filter((p) => p.day === weekday)) {
      const trend = plan.start + (plan.end - plan.start) * progress(plan.pattern, day / DAYS);
      const noise = 1 + (random() - 0.5) * 0.05;
      const raw = trend * deload * detraining(day) * noise;
      const weight = Math.max(plan.step, Math.round(raw / plan.step) * plan.step);
      const reps = between(...plan.reps);

      if (plan.sets && random() < 0.15) {
        // Ran out of steam on the last set.
        rows.push({ name: plan.name, date, sets: plan.sets - 1, reps, weight });
        rows.push({ name: plan.name, date, sets: null, reps: Math.max(1, reps - 2), weight });
      } else {
        rows.push({ name: plan.name, date, sets: plan.sets, reps, weight });
      }
    }
  }
  return rows;
}

async function askPassword() {
  if (process.env.DEMO_PASSWORD) return process.env.DEMO_PASSWORD;
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const write = (rl as unknown as { _writeToOutput: (s: string) => void });
  process.stdout.write(`Password for ${EMAIL} (min 8 chars): `);
  write._writeToOutput = () => {}; // don't echo the password
  const password = await new Promise<string>((resolve) => rl.question("", resolve));
  rl.close();
  process.stdout.write("\n");
  return password;
}

const password = await askPassword();
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const db = getDb();

const builtIns = await db
  .select({ id: exercises.id, name: exercises.name })
  .from(exercises)
  .where(and(isNull(exercises.userId), inArray(exercises.name, PLANS.map((p) => p.name))));
const exerciseIds = new Map(builtIns.map((e) => [e.name, e.id]));
const missing = PLANS.filter((p) => !exerciseIds.has(p.name)).map((p) => p.name);
if (missing.length) {
  console.error(`Missing built-in exercises: ${missing.join(", ")}. Run migrations first.`);
  process.exit(1);
}

// Deleting the user cascades to their sessions, accounts, entries and custom
// exercises.
await db.delete(user).where(eq(user.email, EMAIL));

const userId = generateRandomString(32, "a-z", "A-Z", "0-9");
await db.insert(user).values({ id: userId, name: "Demo", email: EMAIL, emailVerified: true });
await db.insert(account).values({
  id: generateRandomString(32, "a-z", "A-Z", "0-9"),
  accountId: userId,
  providerId: "credential",
  userId,
  password: await hashPassword(password),
});

const rows = generate(localToday()).map(({ name, ...rest }) => ({
  ...rest,
  userId,
  exerciseId: exerciseIds.get(name)!,
}));
for (let i = 0; i < rows.length; i += 500) {
  await db.insert(entries).values(rows.slice(i, i + 500));
}

console.log(`Created ${EMAIL} with ${rows.length} entries across ${PLANS.length} exercises.`);
