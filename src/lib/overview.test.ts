import { describe, expect, it } from "vitest";

import type { MuscleGroup } from "./muscle-groups";
import {
  addDays,
  daysLiftedByWeek,
  recentBests,
  setsByMuscle,
  type OverviewEntry,
  type OverviewExercise,
} from "./overview";
import { estimateOneRepMax } from "./stats";

const TODAY = "2026-10-17";

function entry(date: string, exerciseId: number, weight: number, reps = 5, sets: number | null = 3) {
  return { date, exerciseId, weight, reps, sets } satisfies OverviewEntry;
}

function exercise(id: number, earlierBest: number | null = null): OverviewExercise {
  return { id, name: `Exercise ${id}`, muscleGroup: "chest", earlierBest };
}

describe("addDays", () => {
  it("moves across months and years", () => {
    expect(addDays("2026-10-01", -1)).toBe("2026-09-30");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("setsByMuscle", () => {
  const muscleOf = new Map<number, MuscleGroup>([
    [1, "chest"],
    [2, "back"],
    [3, "quads"],
  ]);

  it("counts the last 7 days against the weekly average of the 4 weeks before", () => {
    const rows = setsByMuscle(
      [
        entry(TODAY, 1, 135), // 3 sets, this week
        entry("2026-10-11", 1, 135, 5, null), // 1 set, 7th day back: this week
        entry("2026-10-10", 1, 135, 5, 4), // previous week
        entry("2026-09-13", 1, 135, 5, 4), // first day of the 4-week average
        entry("2026-09-12", 1, 135, 5, 100), // too old
        entry("2026-10-01", 2, 100, 8, 2), // back: average only
      ],
      muscleOf,
      TODAY,
    );
    expect(rows).toEqual([
      { group: "chest", recent: 4, average: 2 },
      { group: "back", recent: 0, average: 0.5 },
    ]);
  });

  it("ignores entries dated after today", () => {
    expect(setsByMuscle([entry("2026-10-18", 1, 135)], muscleOf, TODAY)).toEqual([]);
  });
});

describe("daysLiftedByWeek", () => {
  it("counts distinct days per 7-day stretch, oldest first, ending today", () => {
    const weeks = daysLiftedByWeek(
      [
        entry(TODAY, 1, 135),
        entry(TODAY, 2, 100), // same day, counted once
        entry("2026-10-11", 1, 135), // still the last stretch
        entry("2026-10-10", 1, 135), // the one before
      ],
      TODAY,
      3,
    );
    expect(weeks).toEqual([
      { end: "2026-10-03", days: 0 },
      { end: "2026-10-10", days: 1 },
      { end: "2026-10-17", days: 2 },
    ]);
  });
});

describe("recentBests", () => {
  it("lists exercises that beat their earlier best in the last 30 days, newest first", () => {
    const bests = recentBests(
      [
        // 1: earlier best in the data (Sep 1), beaten twice; the higher one counts.
        entry("2026-09-01", 1, 200),
        entry("2026-10-01", 1, 205),
        entry("2026-10-08", 1, 210),
        // 2: only matched, not beaten.
        entry("2026-09-01", 2, 100),
        entry("2026-10-10", 2, 100),
        // 3: beats an earlierBest from before the data, by reps at the same weight.
        entry("2026-10-12", 3, 100, 8),
        // 4: first time logged; nothing to beat.
        entry("2026-10-15", 4, 50),
      ],
      [exercise(1), exercise(2), exercise(3, estimateOneRepMax(100, 5)), exercise(4)],
      TODAY,
    );
    expect(bests.map((b) => [b.exerciseId, b.date, b.weight, b.reps])).toEqual([
      [3, "2026-10-12", 100, 8],
      [1, "2026-10-08", 210, 5],
    ]);
  });

  it("uses the 30-day window ending today", () => {
    const bests = recentBests(
      [entry("2026-09-17", 1, 100), entry("2026-09-18", 1, 110)],
      [exercise(1)],
      TODAY,
    );
    // Sep 18 is the first day of the window; Sep 17 is before it.
    expect(bests.map((b) => b.date)).toEqual(["2026-09-18"]);
  });
});
