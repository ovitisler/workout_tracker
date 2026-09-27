"use client";

import { useActionState, useState } from "react";

import { ExercisePicker } from "@/components/exercises/exercise-picker";
import type { Exercise } from "@/lib/exercises";
import type { RoutineExercise } from "@/lib/routines";

import { deleteRoutine, moveInRoutine, removeFromRoutine, renameRoutine } from "./actions";

const smallButton =
  "rounded-md border border-zinc-300 px-2.5 py-1 text-zinc-950 disabled:opacity-30 dark:border-zinc-700 dark:text-zinc-50";

export function RoutineEditor({
  routine,
  items,
  exercises,
}: {
  routine: { id: number; name: string };
  items: RoutineExercise[];
  exercises: Exercise[];
}) {
  const [adding, setAdding] = useState(items.length === 0);
  const [renameState, renameAction, renaming] = useActionState(
    renameRoutine.bind(null, routine.id),
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={renameAction} className="flex flex-col gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-zinc-500">Name</span>
          <div className="flex gap-2">
            <input
              name="name"
              defaultValue={routine.name}
              required
              maxLength={40}
              autoComplete="off"
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
            />
            <button disabled={renaming} className={`${smallButton} shrink-0 px-4`}>
              Rename
            </button>
          </div>
        </label>
        {renameState.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {renameState.error}
          </p>
        )}
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Exercises</h2>
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No exercises yet. Add some below.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-zinc-950 dark:text-zinc-50">{item.name}</span>
                <form action={moveInRoutine.bind(null, routine.id, item.id, -1)}>
                  <button disabled={index === 0} aria-label={`Move ${item.name} up`} className={smallButton}>
                    ↑
                  </button>
                </form>
                <form action={moveInRoutine.bind(null, routine.id, item.id, 1)}>
                  <button
                    disabled={index === items.length - 1}
                    aria-label={`Move ${item.name} down`}
                    className={smallButton}
                  >
                    ↓
                  </button>
                </form>
                <form action={removeFromRoutine.bind(null, routine.id, item.id)}>
                  <button aria-label={`Remove ${item.name}`} className={smallButton}>
                    ✕
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      {adding ? (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">Add exercises</h2>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm text-zinc-600 underline dark:text-zinc-400"
            >
              Done adding
            </button>
          </div>
          <ExercisePicker
            exercises={exercises}
            mode={{ routineId: routine.id, alreadyAdded: items.map((i) => i.id) }}
          />
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="rounded-lg border border-dashed border-zinc-300 py-3 font-medium text-zinc-950 dark:border-zinc-700 dark:text-zinc-50"
        >
          + Add exercises
        </button>
      )}

      <div className="flex flex-col gap-3 pt-4">
        <form
          action={deleteRoutine.bind(null, routine.id)}
          onSubmit={(e) => {
            if (!confirm(`Delete “${routine.name}”? Your logged entries are kept.`)) e.preventDefault();
          }}
          className="text-center"
        >
          <button className="text-sm text-red-600 underline dark:text-red-400">Delete routine</button>
        </form>
      </div>
    </div>
  );
}
