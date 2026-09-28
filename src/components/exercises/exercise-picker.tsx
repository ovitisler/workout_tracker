"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { normalizeExerciseName } from "@/lib/exercise-name";
import { tabPath } from "@/lib/tabs";
import type { Exercise } from "@/lib/exercises";
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUPS } from "@/lib/muscle-groups";

import { addToRoutine } from "@/components/routines/actions";

import { addExercise } from "./actions";
import { ExerciseFormFields } from "./exercise-form-fields";

function matches(name: string, query: string) {
  const haystack = name.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}

// Picking an exercise either opens its screen in the Log tab, or adds it to a
// routine.
export type PickerMode = { tab: "log" } | { routineId: number; alreadyAdded: number[] };

export function ExercisePicker({
  exercises,
  mode,
  top,
}: {
  exercises: Exercise[];
  mode: PickerMode;
  // Shown under the search box while not searching (e.g. recent exercises).
  top?: React.ReactNode;
}) {
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [groupChosen, setGroupChosen] = useState(false);
  const [state, formAction, pending] = useActionState(addExercise, {});

  const typedName = normalizeExerciseName(query);
  const filtered = typedName
    ? exercises.filter((e) => matches(e.name, typedName))
    : exercises;
  const exactMatch = exercises.some(
    (e) => e.name.toLowerCase() === typedName.toLowerCase(),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-[calc(env(safe-area-inset-top)+2.75rem)] z-[5] -mx-4 bg-zinc-50 px-4 py-2 dark:bg-black">
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setAdding(false);
          }}
          placeholder="Search exercises"
          aria-label="Search exercises"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      </div>

      {typedName && !exactMatch && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-3 dark:border-zinc-700">
          {!adding ? (
            <button
              type="button"
              onClick={() => {
                setAdding(true);
                setGroupChosen(false);
              }}
              className="w-full text-left font-medium text-zinc-950 dark:text-zinc-50"
            >
              + Add “{typedName}”
            </button>
          ) : (
            <form action={formAction} className="flex flex-col gap-3">
              <p className="font-medium text-zinc-950 dark:text-zinc-50">New exercise</p>
              {"tab" in mode ? (
                <input type="hidden" name="tab" value={mode.tab} />
              ) : (
                <input type="hidden" name="routineId" value={mode.routineId} />
              )}
              <ExerciseFormFields defaultName={typedName} onGroupChange={() => setGroupChosen(true)} />
              {state.error && (
                <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                  {state.error}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  disabled={pending || !groupChosen}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-blue-500"
                >
                  {pending ? "Adding…" : "routineId" in mode ? "Add to routine" : "Add exercise"}
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="flex-1 rounded-lg border border-zinc-300 py-2.5 font-medium text-zinc-950 dark:border-zinc-700 dark:text-zinc-50"
                >
                  Cancel
                </button>
              </div>
              <p className="text-xs text-zinc-500">
                Custom exercises are only visible to you. You can rename or delete them later in
                Settings.
              </p>
            </form>
          )}
        </div>
      )}

      {!typedName && top}

      {MUSCLE_GROUPS.map((group) => {
        const items = filtered.filter((e) => e.muscleGroup === group);
        if (items.length === 0) return null;
        return (
          <section key={group}>
            <h2 className="mb-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {MUSCLE_GROUP_LABELS[group]}
            </h2>
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {items.map((exercise) => (
                <li key={exercise.id}>
                  <PickerItem exercise={exercise} mode={mode} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {filtered.length === 0 && !typedName && (
        <p className="text-center text-zinc-500">No exercises yet.</p>
      )}
    </div>
  );
}

const itemClass =
  "flex w-full items-center justify-between px-3 py-3 text-left text-zinc-950 active:bg-zinc-100 disabled:opacity-50 dark:text-zinc-50 dark:active:bg-zinc-800";

function PickerItem({ exercise, mode }: { exercise: Exercise; mode: PickerMode }) {
  const custom = exercise.custom && <span className="text-xs text-zinc-500">Custom</span>;

  if ("tab" in mode) {
    return (
      <Link href={`${tabPath(mode.tab)}/${exercise.id}`} className={itemClass}>
        {exercise.name}
        {custom}
      </Link>
    );
  }

  const added = mode.alreadyAdded.includes(exercise.id);
  return (
    <form action={addToRoutine.bind(null, mode.routineId, exercise.id)}>
      <button disabled={added} className={itemClass}>
        {exercise.name}
        {added ? <span className="text-xs text-zinc-500">Added ✓</span> : custom}
      </button>
    </form>
  );
}
