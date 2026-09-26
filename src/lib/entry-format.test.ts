import { describe, expect, it } from "vitest";

import {
  formatDay,
  formatEntry,
  formatWeight,
  groupByDate,
  localToday,
  parseEntryInput,
} from "./entry-format";

const valid = { date: "2026-09-19", sets: "3", reps: "8", weight: "135" };

describe("parseEntryInput", () => {
  it("parses a full entry", () => {
    expect(parseEntryInput(valid)).toEqual({
      ok: true,
      values: { date: "2026-09-19", sets: 3, reps: 8, weight: 135 },
    });
  });

  it("treats blank or 1 sets as a single set", () => {
    for (const sets of ["", " ", "1", null, undefined]) {
      const result = parseEntryInput({ ...valid, sets });
      expect(result.ok && result.values.sets).toBe(null);
    }
  });

  it("accepts fractional weights and rounds to 2 decimals", () => {
    const parse = (weight: string) => {
      const result = parseEntryInput({ ...valid, weight });
      return result.ok ? result.values.weight : result.error;
    };
    expect(parse("137.5")).toBe(137.5);
    expect(parse(".5")).toBe(0.5);
    expect(parse("0")).toBe(0);
    expect(parse("22.333")).toBe(22.33);
  });

  it.each([
    [{ weight: "" }, "Enter the weight in lb."],
    [{ weight: "abc" }, "Enter the weight in lb."],
    [{ weight: "-5" }, "Enter the weight in lb."],
    [{ weight: "10000" }, "That weight is too heavy."],
    [{ reps: "" }, "Reps must be a whole number of at least 1."],
    [{ reps: "0" }, "Reps must be a whole number of at least 1."],
    [{ reps: "8.5" }, "Reps must be a whole number of at least 1."],
    [{ sets: "0" }, "Sets must be a whole number of at least 1."],
    [{ sets: "two" }, "Sets must be a whole number of at least 1."],
    [{ date: "" }, "Pick a date."],
    [{ date: "2026-02-30" }, "Pick a date."],
    [{ date: "09/19/2026" }, "Pick a date."],
  ])("rejects %o", (override, error) => {
    expect(parseEntryInput({ ...valid, ...override })).toEqual({ ok: false, error });
  });
});

describe("formatting", () => {
  it("formats weights without trailing zeros", () => {
    expect(formatWeight(135)).toBe("135");
    expect(formatWeight(137.5)).toBe("137.5");
    expect(formatWeight(22.25)).toBe("22.25");
  });

  it("formats entries, hiding a single set", () => {
    expect(formatEntry({ sets: 3, reps: 8, weight: 135 })).toBe("3 × 8 @ 135 lb");
    expect(formatEntry({ sets: null, reps: 5, weight: 225 })).toBe("5 @ 225 lb");
  });

  it("formats days, adding the year only when it differs", () => {
    expect(formatDay("2026-09-19", "2026-09-26")).toBe("Sat, Sep 19");
    expect(formatDay("2025-12-31", "2026-09-26")).toBe("Wed, Dec 31, 2025");
  });

  it("gives today's local date", () => {
    expect(localToday(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });

  it("groups consecutive entries by date", () => {
    const groups = groupByDate([
      { id: 3, date: "2026-09-19" },
      { id: 2, date: "2026-09-19" },
      { id: 1, date: "2026-09-12" },
    ]);
    expect(groups.map((g) => [g.date, g.entries.map((e) => e.id)])).toEqual([
      ["2026-09-19", [3, 2]],
      ["2026-09-12", [1]],
    ]);
  });
});
