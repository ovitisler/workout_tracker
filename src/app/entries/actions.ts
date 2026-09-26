"use server";

import { and, eq } from "drizzle-orm";
import { refresh } from "next/cache";

import { getDb } from "@/db";
import { entries } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { parseEntryInput } from "@/lib/entry-format";
import { getExercise } from "@/lib/exercises";

export type EntryFormState = { ok?: boolean; error?: string };

function parseForm(formData: FormData) {
  const field = (name: string) => formData.get(name) as string | null;
  return parseEntryInput({
    date: field("date"),
    sets: field("sets"),
    reps: field("reps"),
    weight: field("weight"),
  });
}

export async function createEntry(
  exerciseId: number,
  _prev: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const user = await requireUser();
  if (!(await getExercise(user.id, exerciseId))) {
    return { error: "That exercise doesn't exist." };
  }
  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await getDb()
    .insert(entries)
    .values({ userId: user.id, exerciseId, ...parsed.values });
  refresh();
  return { ok: true };
}

export async function updateEntry(
  entryId: number,
  _prev: EntryFormState,
  formData: FormData,
): Promise<EntryFormState> {
  const user = await requireUser();
  const parsed = parseForm(formData);
  if (!parsed.ok) return { error: parsed.error };

  await getDb()
    .update(entries)
    .set(parsed.values)
    .where(and(eq(entries.id, entryId), eq(entries.userId, user.id)));
  refresh();
  return { ok: true };
}

export async function deleteEntry(entryId: number) {
  const user = await requireUser();
  await getDb()
    .delete(entries)
    .where(and(eq(entries.id, entryId), eq(entries.userId, user.id)));
  refresh();
}
