"use client";

import { ChartLine } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { RecentExercise } from "@/lib/entries";
import { formatDay, formatEntry } from "@/lib/entry-format";
import { useLocalToday } from "@/lib/use-local-today";

// Past this many, show a search box.
const SEARCH_THRESHOLD = 10;

// The Stats tab's list: only exercises with something logged, most recent
// first. Nothing else has stats to show.
export function LoggedExercises({ exercises }: { exercises: RecentExercise[] }) {
  const today = useLocalToday();
  const [query, setQuery] = useState("");

  if (exercises.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 pt-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
          <ChartLine className="size-8" aria-hidden />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-zinc-950 dark:text-zinc-50">No stats yet</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Log an exercise and its progress will show up here: whether you’re getting stronger, your
            best set, and charts over time.
          </p>
        </div>
        <Link
          href="/log"
          className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white dark:bg-blue-500"
        >
          Log an exercise
        </Link>
      </div>
    );
  }

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = exercises.filter((e) => words.every((w) => e.name.toLowerCase().includes(w)));

  return (
    <div className="flex flex-col gap-4">
      <p className="text-zinc-600 dark:text-zinc-400">
        Pick an exercise to see whether you’re getting stronger.
      </p>
      {exercises.length > SEARCH_THRESHOLD && (
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search your exercises"
          aria-label="Search your exercises"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
        />
      )}
      <section>
        <h2 className="mb-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          Exercises you’ve logged · {exercises.length}
        </h2>
        {shown.length === 0 ? (
          <p className="px-1 text-sm text-zinc-500">No logged exercise matches “{query.trim()}”.</p>
        ) : (
          <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            {shown.map((exercise) => (
              <li key={exercise.id}>
                <Link
                  href={`/stats/${exercise.id}`}
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
    </div>
  );
}
