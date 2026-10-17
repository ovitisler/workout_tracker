// The Stats tab's overview (above the exercise list): sets per muscle group,
// progress per exercise and days lifted. Pure, so it's tested; "today" is the device's
// date, passed in by the client component.

import type { MuscleGroup } from "./muscle-groups";
import { MUSCLE_GROUPS } from "./muscle-groups";
import { daysInRange, strengthTrend, summarizeDays, type Trend } from "./stats";

export type OverviewEntry = {
  date: string;
  exerciseId: number;
  sets: number | null;
  reps: number;
  weight: number;
};

export type OverviewExercise = { id: number; name: string; muscleGroup: MuscleGroup };

// How far back the entries go: enough for 3 months of progress and 12 weeks
// of days lifted, plus a day either way for timezones.
export const OVERVIEW_DAYS = 100;
const AVERAGE_WEEKS = 4;

// "2026-10-17" plus n days (n may be negative).
export function addDays(date: string, n: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const setCount = (entry: OverviewEntry) => entry.sets ?? 1;

// Sets per muscle group in the last 7 days (today included), next to the
// weekly average over the 4 weeks before that. Muscle groups with neither are
// left out; the rest keep MUSCLE_GROUPS order so rows don't jump around.
export function setsByMuscle(
  entries: OverviewEntry[],
  muscleOf: Map<number, MuscleGroup>,
  today: string,
) {
  const weekStart = addDays(today, -6);
  const averageStart = addDays(weekStart, -7 * AVERAGE_WEEKS);
  const recent = new Map<MuscleGroup, number>();
  const earlier = new Map<MuscleGroup, number>();
  for (const entry of entries) {
    const group = muscleOf.get(entry.exerciseId);
    if (!group || entry.date > today || entry.date < averageStart) continue;
    const bucket = entry.date >= weekStart ? recent : earlier;
    bucket.set(group, (bucket.get(group) ?? 0) + setCount(entry));
  }
  return MUSCLE_GROUPS.map((group) => ({
    group,
    recent: recent.get(group) ?? 0,
    average: (earlier.get(group) ?? 0) / AVERAGE_WEEKS,
  })).filter((row) => row.recent > 0 || row.average > 0);
}

// Days with anything logged in each of the last `weeks` 7-day stretches,
// oldest first; the last one ends today. `end` is each stretch's last day.
export function daysLiftedByWeek(entries: OverviewEntry[], today: string, weeks = 12) {
  const dates = new Set(entries.map((entry) => entry.date));
  return Array.from({ length: weeks }, (_, i) => {
    const end = addDays(today, -7 * (weeks - 1 - i));
    let days = 0;
    for (let d = 0; d < 7; d++) if (dates.has(addDays(end, -d))) days++;
    return { end, days };
  });
}

export type ExerciseProgress = { exerciseId: number; name: string; trend: Trend };

// Each exercise's strength trend over the last 3 months (the same as its
// Stats page on 3M), biggest gain first. Exercises without enough data for a
// trend (3 days over 2 weeks) are left out.
export function progress(
  entries: OverviewEntry[],
  exercises: OverviewExercise[],
  today: string,
): ExerciseProgress[] {
  const byExercise = new Map<number, OverviewEntry[]>();
  for (const entry of entries) {
    if (entry.date > today) continue;
    const list = byExercise.get(entry.exerciseId);
    if (list) list.push(entry);
    else byExercise.set(entry.exerciseId, [entry]);
  }
  return exercises
    .flatMap((exercise) => {
      const days = daysInRange(summarizeDays(byExercise.get(exercise.id) ?? []), "3M", today);
      const trend = strengthTrend(days);
      return trend ? [{ exerciseId: exercise.id, name: exercise.name, trend }] : [];
    })
    .sort((a, b) => b.trend.change - a.trend.change || a.name.localeCompare(b.name));
}
