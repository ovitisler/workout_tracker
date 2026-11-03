import { describe, expect, it } from "vitest";

import { summarizeToday, type TodayEntry } from "./today";

const TODAY = "2026-11-02";

let nextId = 1;
function entry(
  exerciseId: number,
  sets: number | null,
  date = TODAY,
  reps = 8,
  weight = 100,
): TodayEntry {
  return { id: nextId++, date, exerciseId, name: `Exercise ${exerciseId}`, sets, reps, weight };
}

describe("summarizeToday", () => {
  it("is empty when nothing was logged today", () => {
    expect(summarizeToday([], TODAY)).toEqual({ exercises: [], totalSets: 0 });
    expect(summarizeToday([entry(1, 3, "2026-11-01")], TODAY)).toEqual({
      exercises: [],
      totalSets: 0,
    });
  });

  it("ignores entries from other days", () => {
    const result = summarizeToday(
      [entry(1, 3, "2026-11-01"), entry(2, 4), entry(3, 5, "2026-11-03")],
      TODAY,
    );
    expect(result.exercises.map((e) => e.exerciseId)).toEqual([2]);
    expect(result.totalSets).toBe(4);
  });

  it("counts an entry with no sets as one set", () => {
    const result = summarizeToday([entry(1, null)], TODAY);
    expect(result.exercises[0].sets).toBe(1);
    expect(result.totalSets).toBe(1);
  });

  it("groups several entries for one exercise and adds up their sets", () => {
    const result = summarizeToday([entry(1, 3), entry(2, 2), entry(1, null, TODAY, 5, 135)], TODAY);
    expect(result.exercises).toHaveLength(2);
    expect(result.exercises[0].exerciseId).toBe(1);
    expect(result.exercises[0].sets).toBe(4);
    expect(result.exercises[0].entries).toHaveLength(2);
    expect(result.totalSets).toBe(6);
  });

  it("orders exercises by when they were first logged, whatever order the rows arrive in", () => {
    const rows = [entry(7, 1), entry(3, 1), entry(7, 1)];
    const result = summarizeToday([...rows].reverse(), TODAY);
    expect(result.exercises.map((e) => e.exerciseId)).toEqual([7, 3]);
    expect(result.exercises[0].entries.map((e) => e.id)).toEqual([rows[0].id, rows[2].id]);
  });
});
