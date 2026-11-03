"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { EntryText } from "@/components/entries/entry-text";
import { summarizeToday, type TodayEntry } from "@/lib/today";
import { useLocalToday } from "@/lib/use-local-today";

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Everything logged today, whichever routine (if any) it was for: handy when a
// workout wanders off the routine or an exercise is in more than one. Nothing
// is shown until the device's date is known, or while nothing's logged today.
export function TodaysWorkouts({ entries }: { entries: TodayEntry[] }) {
  const today = useLocalToday();
  if (!today) return null;

  const { exercises, totalSets } = summarizeToday(entries, today);
  if (exercises.length === 0) return null;

  return (
    <section aria-labelledby="today-heading" className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-2 px-1">
        <h2
          id="today-heading"
          className="text-xs font-semibold tracking-wide text-zinc-500 uppercase"
        >
          Today
        </h2>
        <p className="text-xs text-zinc-500">
          {plural(exercises.length, "exercise")} · {plural(totalSets, "set")}
        </p>
      </div>
      <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
        {exercises.map((exercise) => (
          <li key={exercise.exerciseId}>
            <Link
              href={`/log/${exercise.exerciseId}`}
              className="flex items-center gap-3 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-zinc-950 dark:text-zinc-50">
                  {exercise.name}
                </span>
                {exercise.entries.map((entry) => (
                  <span key={entry.id} className="block text-sm">
                    <EntryText entry={entry} />
                  </span>
                ))}
              </span>
              <ChevronRight className="size-5 shrink-0 text-zinc-400" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
