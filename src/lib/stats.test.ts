import { describe, expect, it } from "vitest";

import {
  bestDay,
  daysInRange,
  estimateOneRepMax,
  niceTicks,
  rangeStart,
  strengthTrend,
  summarizeDays,
  type Day,
} from "./stats";

const day = (date: string, weight: number, reps = 5): Day => ({
  date,
  weight,
  reps,
  sets: 3,
  strength: estimateOneRepMax(weight, reps),
});

describe("estimateOneRepMax", () => {
  it("is the weight itself for a single rep", () => {
    expect(estimateOneRepMax(225, 1)).toBe(225);
  });

  it("gives more reps at the same weight a higher estimate", () => {
    expect(estimateOneRepMax(135, 10)).toBeGreaterThan(estimateOneRepMax(135, 8));
    expect(estimateOneRepMax(150, 30)).toBe(300);
  });
});

describe("summarizeDays", () => {
  it("keeps the heaviest set per day, oldest day first", () => {
    const days = summarizeDays([
      { date: "2026-09-19", sets: 2, reps: 6, weight: 205 },
      { date: "2026-09-19", sets: null, reps: 4, weight: 205 },
      { date: "2026-09-12", sets: 3, reps: 8, weight: 185 },
      { date: "2026-09-12", sets: null, reps: 3, weight: 195 },
    ]);
    expect(days.map((d) => [d.date, d.weight, d.reps, d.sets])).toEqual([
      ["2026-09-12", 195, 3, null],
      ["2026-09-19", 205, 6, 2],
    ]);
  });

  it("uses the best estimated strength of the day, even from a lighter set", () => {
    const [only] = summarizeDays([
      { date: "2026-09-12", sets: null, reps: 1, weight: 200 },
      { date: "2026-09-12", sets: 3, reps: 12, weight: 180 },
    ]);
    expect(only.weight).toBe(200);
    expect(only.strength).toBeCloseTo(252);
  });
});

describe("ranges", () => {
  it("goes back whole months from today", () => {
    expect(rangeStart("3M", "2026-09-26")).toBe("2026-06-26");
    expect(rangeStart("1Y", "2026-09-26")).toBe("2025-09-26");
    expect(rangeStart("All", "2026-09-26")).toBe(null);
  });

  it("filters days to the range, inclusive", () => {
    const days = [day("2026-06-25", 100), day("2026-06-26", 100), day("2026-09-01", 100)];
    expect(daysInRange(days, "3M", "2026-09-26").map((d) => d.date)).toEqual([
      "2026-06-26",
      "2026-09-01",
    ]);
    expect(daysInRange(days, "All", "2026-09-26")).toHaveLength(3);
  });
});

describe("strengthTrend", () => {
  const weekly = (weights: number[]) =>
    weights.map((w, i) => day(new Date(Date.UTC(2026, 0, 1 + i * 7)).toISOString().slice(0, 10), w));

  it("detects going up, down and flat", () => {
    expect(strengthTrend(weekly([100, 105, 110, 115, 120]))?.direction).toBe("up");
    expect(strengthTrend(weekly([120, 115, 110, 105, 100]))?.direction).toBe("down");
    expect(strengthTrend(weekly([100, 101, 99, 100, 101]))?.direction).toBe("flat");
  });

  it("reports the fitted change as a fraction", () => {
    expect(strengthTrend(weekly([100, 110, 120]))?.change).toBeCloseTo(0.2);
  });

  it("isn't swayed much by one outlier", () => {
    expect(strengthTrend(weekly([100, 100, 100, 130, 100, 100, 100]))?.direction).toBe("flat");
  });

  it("needs at least 3 days spanning 2 weeks", () => {
    expect(strengthTrend(weekly([100, 110]))).toBe(null);
    expect(strengthTrend([day("2026-01-01", 100), day("2026-01-03", 110), day("2026-01-05", 120)])).toBe(null);
  });
});

describe("bestDay", () => {
  it("picks the heaviest, then most reps, then most recent", () => {
    const days = [day("2026-01-01", 200, 5), day("2026-02-01", 205, 3), day("2026-03-01", 205, 3)];
    expect(bestDay(days)?.date).toBe("2026-03-01");
    expect(bestDay([])).toBe(undefined);
  });
});

describe("niceTicks", () => {
  it("covers the range with round steps", () => {
    expect(niceTicks(133, 212)).toEqual([120, 140, 160, 180, 200, 220]);
    expect(niceTicks(3, 8)).toEqual([2, 4, 6, 8]);
  });

  it("handles a single value", () => {
    expect(niceTicks(135, 135)).toEqual([134, 134.5, 135, 135.5, 136]);
  });
});
