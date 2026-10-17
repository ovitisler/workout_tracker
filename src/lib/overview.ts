// The Stats tab's overview (above the exercise list): sets per muscle group,
// recent bests and days lifted. Pure, so it's tested; "today" is the device's
// date, passed in by the client component.

import type { MuscleGroup } from "./muscle-groups";
import { MUSCLE_GROUPS } from "./muscle-groups";
import { estimateOneRepMax } from "./stats";

export type OverviewEntry = {
  date: string;
  exerciseId: number;
  sets: number | null;
  reps: number;
  weight: number;
};

export type OverviewExercise = {
  id: number;
  name: string;
  muscleGroup: MuscleGroup;
  // Best estimated 1RM from entries older than the ones sent (see
  // getOverview), or null if there are none.
  earlierBest: number | null;
};

// How far back the entries go. Enough for 12 weeks of days lifted plus a
// day either way for timezones; anything older only counts via earlierBest.
export const OVERVIEW_DAYS = 90;

export const BEST_WINDOW_DAYS = 30;
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

// Exercises whose best estimated 1RM in the last 30 days beats everything
// before, newest first, each with the entry that did it. An exercise logged
// for the first time in the window isn't a "best": there's nothing to beat.
export function recentBests(
  entries: OverviewEntry[],
  exercises: OverviewExercise[],
  today: string,
) {
  const windowStart = addDays(today, -(BEST_WINDOW_DAYS - 1));
  const before = new Map<number, number>();
  const inWindow = new Map<number, { entry: OverviewEntry; strength: number }>();
  for (const entry of entries) {
    if (entry.date > today) continue;
    const strength = estimateOneRepMax(entry.weight, entry.reps);
    if (entry.date < windowStart) {
      before.set(entry.exerciseId, Math.max(before.get(entry.exerciseId) ?? 0, strength));
      continue;
    }
    const top = inWindow.get(entry.exerciseId);
    // Ties go to the later day: that's when it was matched most recently.
    if (!top || strength > top.strength || (strength === top.strength && entry.date > top.entry.date)) {
      inWindow.set(entry.exerciseId, { entry, strength });
    }
  }

  return exercises
    .flatMap((exercise) => {
      const top = inWindow.get(exercise.id);
      const earlier = Math.max(before.get(exercise.id) ?? -1, exercise.earlierBest ?? -1);
      if (!top || earlier < 0 || top.strength <= earlier + 1e-9) return [];
      const { date, sets, reps, weight } = top.entry;
      return [{ exerciseId: exercise.id, name: exercise.name, date, sets, reps, weight }];
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.name.localeCompare(b.name));
}
