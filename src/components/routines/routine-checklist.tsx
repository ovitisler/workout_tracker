"use client";

import Link from "next/link";

import { formatDay, formatEntry } from "@/lib/entry-format";
import type { RoutineExercise } from "@/lib/routines";
import { useLocalToday } from "@/lib/use-local-today";

// The gym view: tap an exercise to log it; it's checked once it has an entry
// dated today.
export function RoutineChecklist({
  routineId,
  items,
}: {
  routineId: number;
  items: RoutineExercise[];
}) {
  const today = useLocalToday();
  const done = items.filter((item) => today && item.latest?.date === today).length;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-zinc-500" aria-live="polite">
        {today ? `${done} of ${items.length} done today · tap an exercise to log it` : " "}
      </p>
      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
        {items.map((item) => {
          const isDone = Boolean(today) && item.latest?.date === today;
          return (
            <li key={item.id}>
              <Link
                href={`/routines/${routineId}/${item.id}`}
                className="flex items-center gap-3 px-3 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <span
                  aria-label={isDone ? "Done today" : "Not done today"}
                  className={
                    isDone
                      ? "flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm text-white dark:bg-blue-500 dark:text-white"
                      : "size-6 shrink-0 rounded-full border-2 border-zinc-300 dark:border-zinc-600"
                  }
                >
                  {isDone && "✓"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-zinc-950 dark:text-zinc-50">{item.name}</span>
                  <span className="block truncate text-sm text-zinc-500">
                    {item.latest
                      ? `${isDone ? "Today" : "Last"}: ${formatEntry(item.latest)}${isDone ? "" : ` · ${formatDay(item.latest.date, today || item.latest.date)}`}`
                      : "Not logged yet"}
                  </span>
                </span>
                <span className="shrink-0 text-zinc-400" aria-hidden>
                  ›
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
