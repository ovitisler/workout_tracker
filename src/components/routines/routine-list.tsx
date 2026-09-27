"use client";

import { CircleCheck, ChevronRight, ListChecks, X } from "lucide-react";
import Link from "next/link";

import { formatDay } from "@/lib/entry-format";
import { useLocalToday } from "@/lib/use-local-today";

import { TemplatePicker } from "./template-picker";

type Routine = {
  id: number;
  name: string;
  exerciseNames: string[];
  lastLogged: (string | null)[];
  lastDone: string | null;
};


// "Push, Pull and Legs"
function listNames(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names.at(-1)}` : names[0];
}

export function RoutineList({
  routines,
  justAdded,
}: {
  routines: Routine[];
  // Names of routines just added from a template, to confirm what happened.
  justAdded?: string[];
}) {
  const today = useLocalToday();

  if (routines.length === 0) return <EmptyState />;

  return (
    <div className="flex flex-col gap-4">
      {justAdded && (
        <div
          role="status"
          className="flex gap-3 rounded-lg bg-blue-50 p-3 text-sm text-blue-950 dark:bg-blue-950 dark:text-blue-100"
        >
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
          <p className="flex-1">
            Added {listNames(justAdded)}. Open one to use it at the gym, and tap{" "}
            <span className="font-semibold">Edit</span> inside to change its exercises.
          </p>
          <Link href="/routines" aria-label="Dismiss" className="shrink-0 text-blue-600 dark:text-blue-400">
            <X className="size-5" aria-hidden />
          </Link>
        </div>
      )}
      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
      {routines.map((routine) => {
        const total = routine.lastLogged.length;
        const done = today ? routine.lastLogged.filter((date) => date === today).length : 0;
        const status = [
          total > 0 && `${total} exercise${total === 1 ? "" : "s"}`,
          routine.lastDone
            ? routine.lastDone === today
              ? "done today"
              : `last done ${today ? formatDay(routine.lastDone, today) : ""}`
            : total > 0 && "not done yet",
          done > 0 && `${done}/${total} today`,
        ]
          .filter(Boolean)
          .join(" · ");

        return (
          <li key={routine.id}>
            <Link
              href={`/routines/${routine.id}`}
              className="flex items-center gap-3 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-lg font-medium text-zinc-950 dark:text-zinc-50">
                  {routine.name}
                </span>
                <span className="block truncate text-sm text-zinc-600 dark:text-zinc-400">
                  {routine.exerciseNames.join(", ") || "No exercises yet"}
                </span>
                {status && <span className="block text-xs text-zinc-500">{status}</span>}
              </span>
              <ChevronRight className="size-5 shrink-0 text-zinc-400" aria-hidden />
            </Link>
          </li>
        );
      })}
      </ul>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-5 pt-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
        <ListChecks className="size-8" aria-hidden />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">No routines yet</h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          A routine is the list of exercises you do together, like “Upper 1” or “Leg day”. At the
          gym, open it and tap through.
        </p>
      </div>
      <Link
        href="/routines/new"
        className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white dark:bg-blue-500"
      >
        Create your first routine
      </Link>
      <div className="flex w-full flex-col gap-2">
        <p className="text-sm text-zinc-500">Or start from a template:</p>
        <TemplatePicker />
      </div>
      <p className="text-sm text-zinc-500">
        Just want to log one exercise?{" "}
        <Link href="/log" className="font-medium text-blue-600 dark:text-blue-400">
          Go to Log
        </Link>
      </p>
    </div>
  );
}
