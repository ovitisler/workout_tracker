import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { entries } from "@/db/schema";

export type Entry = Awaited<ReturnType<typeof listEntries>>[number];

// Newest day first; within a day, in the order they were logged.
export function listEntries(userId: string, exerciseId: number) {
  return getDb()
    .select({
      id: entries.id,
      date: entries.date,
      sets: entries.sets,
      reps: entries.reps,
      weight: entries.weight,
    })
    .from(entries)
    .where(and(eq(entries.userId, userId), eq(entries.exerciseId, exerciseId)))
    .orderBy(desc(entries.date), asc(entries.id));
}
