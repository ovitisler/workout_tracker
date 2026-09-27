import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { findTemplate, ROUTINE_TEMPLATES, uniqueName } from "./routine-templates";

// Built-in exercise names, from the migration that seeds them.
const seedSql = readFileSync(new URL("../../drizzle/0003_seed_exercises.sql", import.meta.url), "utf8");
const builtIns = new Set([...seedSql.matchAll(/\('([^']+)', '\w+'\)/g)].map((m) => m[1]));

describe("routine templates", () => {
  it("only use built-in exercises", () => {
    expect(builtIns.size).toBeGreaterThan(80);
    for (const template of ROUTINE_TEMPLATES) {
      for (const routine of template.routines) {
        for (const exercise of routine.exercises) {
          expect(builtIns, `${template.id} › ${routine.name} › ${exercise}`).toContain(exercise);
        }
      }
    }
  });

  it("have unique ids, and no repeats within a routine", () => {
    expect(new Set(ROUTINE_TEMPLATES.map((t) => t.id)).size).toBe(ROUTINE_TEMPLATES.length);
    for (const template of ROUTINE_TEMPLATES) {
      for (const routine of template.routines) {
        expect(new Set(routine.exercises).size).toBe(routine.exercises.length);
      }
    }
  });

  it("can be looked up by id", () => {
    expect(findTemplate("upper-lower")?.routines.map((r) => r.name)).toEqual([
      "Upper 1",
      "Lower 1",
      "Upper 2",
      "Lower 2",
    ]);
    expect(findTemplate("nope")).toBe(undefined);
  });
});

describe("uniqueName", () => {
  it("keeps free names and numbers taken ones, ignoring case", () => {
    expect(uniqueName("Push", [])).toBe("Push");
    expect(uniqueName("Push", ["push"])).toBe("Push (2)");
    expect(uniqueName("Push", ["Push", "Push (2)"])).toBe("Push (3)");
  });
});
