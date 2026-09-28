"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { addToRoutine } from "@/components/routines/actions";
import { getDb } from "@/db";
import { entries, exercises } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { normalizeExerciseName } from "@/lib/exercise-name";
import { findExerciseByName, getCustomExercise } from "@/lib/exercises";
import { isMuscleGroup } from "@/lib/muscle-groups";

export type AddExerciseState = { error?: string };

export async function addExercise(
  _prev: AddExerciseState,
  formData: FormData,
): Promise<AddExerciseState> {
  const user = await requireUser();
  const name = normalizeExerciseName(String(formData.get("name") ?? ""));
  const muscleGroup = formData.get("muscleGroup");
  const routineId = Number(formData.get("routineId")) || undefined;

  if (!name || name.length > 60) {
    return { error: "Name must be 1–60 characters." };
  }
  if (!isMuscleGroup(muscleGroup)) {
    return { error: "Pick a muscle group." };
  }

  // If it already exists (built-in or theirs), use that one.
  const exerciseId =
    (await findExerciseByName(user.id, name))?.id ??
    (
      await getDb()
        .insert(exercises)
        .values({ userId: user.id, name, muscleGroup })
        .returning({ id: exercises.id })
    )[0].id;

  if (routineId) {
    await addToRoutine(routineId, exerciseId);
    redirect(`/routines/${routineId}/edit`);
  }
  redirect(`/log/${exerciseId}`);
}

export type EditExerciseState = { error?: string };

// Rename a custom exercise or change its muscle group.
export async function updateCustomExercise(
  id: number,
  _prev: EditExerciseState,
  formData: FormData,
): Promise<EditExerciseState> {
  const user = await requireUser();
  if (!(await getCustomExercise(user.id, id))) return { error: "That exercise doesn't exist." };

  const name = normalizeExerciseName(String(formData.get("name") ?? ""));
  const muscleGroup = formData.get("muscleGroup");
  if (!name || name.length > 60) return { error: "Name must be 1–60 characters." };
  if (!isMuscleGroup(muscleGroup)) return { error: "Pick a muscle group." };

  const clash = await findExerciseByName(user.id, name);
  if (clash && clash.id !== id) {
    return {
      error: clash.custom
        ? `You already have an exercise called “${clash.name}”.`
        : `“${clash.name}” is already a built-in exercise.`,
    };
  }

  await getDb()
    .update(exercises)
    .set({ name, muscleGroup })
    .where(and(eq(exercises.id, id), eq(exercises.userId, user.id)));
  redirect("/settings/exercises");
}

// Deletes a custom exercise along with its logged entries (routines drop it
// automatically). The screen confirms first, saying how many entries go.
export async function deleteCustomExercise(id: number) {
  const user = await requireUser();
  if (!(await getCustomExercise(user.id, id))) return;
  const db = getDb();
  await db.batch([
    db.delete(entries).where(and(eq(entries.exerciseId, id), eq(entries.userId, user.id))),
    db.delete(exercises).where(and(eq(exercises.id, id), eq(exercises.userId, user.id))),
  ]);
  redirect("/settings/exercises");
}
