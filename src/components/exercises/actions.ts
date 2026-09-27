"use server";

import { redirect } from "next/navigation";

import { tabPath } from "@/lib/tabs";

import { addToRoutine } from "@/components/routines/actions";
import { getDb } from "@/db";
import { exercises } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { normalizeExerciseName } from "@/lib/exercise-name";
import { findExerciseByName } from "@/lib/exercises";
import { isMuscleGroup } from "@/lib/muscle-groups";

export type AddExerciseState = { error?: string };

export async function addExercise(
  _prev: AddExerciseState,
  formData: FormData,
): Promise<AddExerciseState> {
  const user = await requireUser();
  const name = normalizeExerciseName(String(formData.get("name") ?? ""));
  const muscleGroup = formData.get("muscleGroup");
  const returnTo = tabPath(formData.get("tab") === "stats" ? "stats" : "log");
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
  redirect(`${returnTo}/${exerciseId}`);
}
