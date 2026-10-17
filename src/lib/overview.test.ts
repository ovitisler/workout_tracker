import { describe, expect, it } from "vitest";

import type { MuscleGroup } from "./muscle-groups";
import {
  addDays,
  daysLiftedByWeek,
  progress,
  setsByMuscle,
  type OverviewEntry,
  type OverviewExercise,
} from "./overview";

const TODAY = "2026-10-17";

function entry(date: string, exerciseId: number, weight: number, reps = 5, sets: number | null = 3) {
  return { date, exerciseId, weight, reps, sets } satisfies OverviewEntry;
}

function exercise(id: number): OverviewExercise {
  return { id, name: `Exercise ${id}`, muscleGroup: "chest" };
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
  it("counts days and sets per 7-day stretch, oldest first, ending today", () => {
    const weeks = daysLiftedByWeek(
      [
        entry(TODAY, 1, 135), // 3 sets
        entry(TODAY, 2, 100, 8, 2), // same day: 5 sets in all, one day
        entry("2026-10-11", 1, 135, 5, null), // 1 set, still the last stretch
        entry("2026-10-10", 1, 135, 5, 4), // the one before
      ],
      TODAY,
      3,
    );
    expect(weeks).toEqual([
      { end: "2026-10-03", days: 0, sets: 0, daySets: [] },
      { end: "2026-10-10", days: 1, sets: 4, daySets: [4] },
      { end: "2026-10-17", days: 2, sets: 6, daySets: [1, 5] },
    ]);
  });

  it("ignores entries dated after today", () => {
    const [week] = daysLiftedByWeek([entry("2026-10-18", 1, 135)], TODAY, 1);
    expect(week).toEqual({ end: TODAY, days: 0, sets: 0, daySets: [] });
  });
});

describe("progress", () => {
  it("gives each exercise's 3-month trend, biggest gain first", () => {
    const rows = progress(
      [
        // 1: up 10% over the 3 months.
        entry("2026-08-01", 1, 200),
        entry("2026-09-10", 1, 210),
        entry("2026-10-15", 1, 220),
        // 2: flat.
        entry("2026-08-01", 2, 100),
        entry("2026-09-10", 2, 100),
        entry("2026-10-15", 2, 100),
        // 3: down.
        entry("2026-08-01", 3, 100),
        entry("2026-09-10", 3, 95),
        entry("2026-10-15", 3, 90),
        // 4: only two days, not enough for a trend.
        entry("2026-09-10", 4, 50),
        entry("2026-10-15", 4, 60),
      ],
      [exercise(1), exercise(2), exercise(3), exercise(4)],
      TODAY,
    );
    expect(rows.map((r) => [r.exerciseId, r.trend.direction])).toEqual([
      [1, "up"],
      [2, "flat"],
      [3, "down"],
    ]);
    expect(rows[0].trend.change).toBeCloseTo(0.1);
  });

  it("only looks at the last 3 months", () => {
    // A big drop before Jul 17 doesn't count; after it, it's flat.
    const rows = progress(
      [
        entry("2026-06-01", 1, 300),
        entry("2026-08-01", 1, 200),
        entry("2026-09-10", 1, 200),
        entry("2026-10-15", 1, 200),
      ],
      [exercise(1)],
      TODAY,
    );
    expect(rows.map((r) => r.trend.direction)).toEqual(["flat"]);
  });
});
