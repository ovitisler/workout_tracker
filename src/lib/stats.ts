// Pure helpers for the stats screen. No server or database imports.

type EntryLike = { date: string; sets: number | null; reps: number; weight: number };

export type Day = {
  date: string; // "YYYY-MM-DD"
  weight: number; // heaviest weight that day
  reps: number; // reps at that weight (the most, if several entries)
  sets: number | null;
  strength: number; // best estimated 1-rep max that day
};

export const RANGES = ["3M", "6M", "1Y", "All"] as const;
export type Range = (typeof RANGES)[number];

const MONTHS: Record<Exclude<Range, "All">, number> = { "3M": 3, "6M": 6, "1Y": 12 };

// Estimated one-rep max (Epley). Lets "same weight, more reps" count as
// getting stronger.
export function estimateOneRepMax(weight: number, reps: number) {
  return reps <= 1 ? weight : weight * (1 + reps / 30);
}

// One point per day, oldest first. The day's "top set" is the heaviest
// weight, breaking ties by reps.
export function summarizeDays(entries: EntryLike[]): Day[] {
  const days = new Map<string, Day>();
  for (const entry of entries) {
    const strength = estimateOneRepMax(entry.weight, entry.reps);
    const day = days.get(entry.date);
    if (!day) {
      days.set(entry.date, { date: entry.date, weight: entry.weight, reps: entry.reps, sets: entry.sets, strength });
      continue;
    }
    if (entry.weight > day.weight || (entry.weight === day.weight && entry.reps > day.reps)) {
      day.weight = entry.weight;
      day.reps = entry.reps;
      day.sets = entry.sets;
    }
    day.strength = Math.max(day.strength, strength);
  }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}

// First day included in a range ending today, or null for "All".
export function rangeStart(range: Range, today: string): string | null {
  if (range === "All") return null;
  const date = new Date(`${today}T00:00:00Z`);
  date.setUTCMonth(date.getUTCMonth() - MONTHS[range]);
  return date.toISOString().slice(0, 10);
}

export function daysInRange(days: Day[], range: Range, today: string) {
  const start = rangeStart(range, today);
  return start ? days.filter((d) => d.date >= start) : days;
}

export function toDayNumber(date: string) {
  return Date.parse(`${date}T00:00:00Z`) / 86_400_000;
}

export type Trend = { direction: "up" | "flat" | "down"; change: number };

// Changes smaller than this (either way) count as flat.
const FLAT_THRESHOLD = 0.025;

// Direction of estimated strength over the days given, from a straight-line
// fit (so one great or bad day doesn't swing it). `change` is the fitted
// change from the first day to the last, as a fraction (0.08 = +8%). Null
// when there's too little data to say.
export function strengthTrend(days: Day[]): Trend | null {
  if (days.length < 3) return null;
  const xs = days.map((d) => toDayNumber(d.date));
  const ys = days.map((d) => d.strength);
  const span = xs.at(-1)! - xs[0];
  if (span < 14) return null;

  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - meanX) * (ys[i] - meanY);
    den += (xs[i] - meanX) ** 2;
  }
  const slope = num / den;
  const startValue = meanY + slope * (xs[0] - meanX);
  if (startValue <= 0) return null;

  const change = (slope * span) / startValue;
  const direction = change > FLAT_THRESHOLD ? "up" : change < -FLAT_THRESHOLD ? "down" : "flat";
  return { direction, change };
}

// Heaviest top set (ties: more reps, then most recent).
export function bestDay(days: Day[]): Day | undefined {
  let best: Day | undefined;
  for (const day of days) {
    if (!best || day.weight > best.weight || (day.weight === best.weight && day.reps >= best.reps)) {
      best = day;
    }
  }
  return best;
}

// Round, evenly spaced axis ticks covering [min, max].
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const rough = (max - min) / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= rough)!;
  const ticks: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= max + step * 1e-9; v += step) {
    ticks.push(Math.round(v * 1e6) / 1e6);
  }
  if (ticks.at(-1)! < max) ticks.push(Math.round((ticks.at(-1)! + step) * 1e6) / 1e6);
  return ticks;
}
