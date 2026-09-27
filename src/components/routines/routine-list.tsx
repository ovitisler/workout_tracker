"use client";

import Link from "next/link";

import { useLocalToday } from "@/lib/use-local-today";

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
          Routines are the sets of exercises you do together, like “Upper 1” or “Leg day”. Tap + to
          make one, add exercises, and at the gym just open it and tap through.
        </p>
      )}
    </div>
  );
}
