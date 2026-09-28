"use client";

import { useActionState, useTransition } from "react";

import type { CustomExercise } from "@/lib/exercises";

import { deleteCustomExercise, updateCustomExercise } from "./actions";
import { ExerciseFormFields } from "./exercise-form-fields";

const entriesLabel = (n: number) => `${n} logged ${n === 1 ? "entry" : "entries"}`;
const routinesLabel = (n: number) => `${n} ${n === 1 ? "routine" : "routines"}`;

export function EditExerciseForm({ exercise }: { exercise: CustomExercise }) {
  const [state, formAction, saving] = useActionState(
    updateCustomExercise.bind(null, exercise.id),
    {},
  );
  const [deleting, startDelete] = useTransition();

  const uses = [
    exercise.entryCount > 0 && entriesLabel(exercise.entryCount),
    exercise.routineCount > 0 && `in ${routinesLabel(exercise.routineCount)}`,
  ].filter(Boolean);

  function confirmDelete() {
    const warning =
      exercise.entryCount > 0
        ? `Delete “${exercise.name}” and its ${entriesLabel(exercise.entryCount)}? This can't be undone.`
        : `Delete “${exercise.name}”?`;
    if (confirm(warning)) startDelete(() => deleteCustomExercise(exercise.id));
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-3">
        <ExerciseFormFields defaultName={exercise.name} defaultGroup={exercise.muscleGroup} />
        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          disabled={saving || deleting}
          className="rounded-lg bg-blue-600 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-blue-500"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </form>

      <section className="flex flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">
          {uses.length > 0 ? `Used: ${uses.join(", ")}.` : "Not used anywhere yet."}
          {exercise.entryCount > 0 && " Deleting it also deletes those entries."}
        </p>
        <button
          type="button"
          onClick={confirmDelete}
          disabled={saving || deleting}
          className="rounded-lg border border-red-300 py-2.5 font-medium text-red-600 disabled:opacity-50 dark:border-red-900 dark:text-red-400"
        >
          {deleting ? "Deleting…" : "Delete exercise"}
        </button>
      </section>
    </div>
  );
}
