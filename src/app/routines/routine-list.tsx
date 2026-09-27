"use client";

import Link from "next/link";
import { useActionState } from "react";

import { useLocalToday } from "@/lib/use-local-today";

import { createRoutine } from "./actions";

type Routine = { id: number; name: string; lastLogged: (string | null)[] };

export function RoutineList({ routines }: { routines: Routine[] }) {
  const today = useLocalToday();

  return (
    <div className="flex flex-col gap-4 pt-2">
      {routines.length > 0 ? (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {routines.map((routine) => {
            const total = routine.lastLogged.length;
            const done = routine.lastLogged.filter((date) => today && date === today).length;
            return (
              <li key={routine.id}>
                <Link
                  href={`/routines/${routine.id}`}
                  className="flex items-center justify-between gap-3 px-4 py-4 active:bg-zinc-100 dark:active:bg-zinc-800"
                >
                  <span className="text-lg font-medium text-zinc-950 dark:text-zinc-50">{routine.name}</span>
                  <span className="shrink-0 text-sm text-zinc-500">
                    {total === 0
                      ? "No exercises"
                      : done > 0
                        ? `${done}/${total} done today`
                        : `${total} exercise${total === 1 ? "" : "s"}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">
          Routines are the sets of exercises you do together, like “Upper 1” or “Leg day”. Make one, add
          exercises, and at the gym just open it and tap through.
        </p>
      )}
      <NewRoutineForm />
    </div>
  );
}

function NewRoutineForm() {
  const [state, formAction, pending] = useActionState(createRoutine, {});
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          maxLength={40}
          placeholder="New routine, e.g. Lower 1"
          aria-label="New routine name"
          autoComplete="off"
          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
        />
        <button
          disabled={pending}
          className="shrink-0 rounded-lg bg-zinc-950 px-4 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Create
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
