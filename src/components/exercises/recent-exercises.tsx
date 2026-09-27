"use client";

import Link from "next/link";

import type { RecentExercise } from "@/lib/entries";
import { formatDay, formatEntry } from "@/lib/entry-format";
import { useLocalToday } from "@/lib/use-local-today";

// Exercises logged most recently, for quick access at the top of the Log and
// Stats pickers. For a new user, a hint about what will appear here.
export function RecentExercises({
  recent,
  basePath,
  emptyHint,
}: {
  recent: RecentExercise[];
  basePath: string;
  emptyHint: React.ReactNode;
}) {
  const today = useLocalToday();

  return (
    <section>
      <h2 className="mb-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Recent</h2>
      {recent.length === 0 ? (
        <p className="rounded-lg bg-white px-3 py-3 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
          {emptyHint}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {recent.map((exercise) => (
            <li key={exercise.id}>
              <Link
                href={`${basePath}/${exercise.id}`}
                className="flex items-baseline justify-between gap-3 px-3 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <span className="min-w-0 truncate text-zinc-950 dark:text-zinc-50">{exercise.name}</span>
                <span className="shrink-0 text-sm text-zinc-500">
                  {formatEntry(exercise.latest)}
                  {today &&
                    ` · ${exercise.latest.date === today ? "Today" : formatDay(exercise.latest.date, today)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
