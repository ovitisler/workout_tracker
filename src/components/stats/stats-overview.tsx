"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { EntryText } from "@/components/entries/entry-text";
import type { Overview } from "@/lib/entries";
import { formatDay } from "@/lib/entry-format";
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/lib/muscle-groups";
import {
  addDays,
  BEST_WINDOW_DAYS,
  daysLiftedByWeek,
  recentBests,
  setsByMuscle,
} from "@/lib/overview";
import { useLocalToday } from "@/lib/use-local-today";

const headingClass = "text-xs font-semibold tracking-wide text-zinc-500 uppercase";
const cardClass = "rounded-lg bg-white p-3 dark:bg-zinc-900";

// 2.5 → "2.5", 3 → "3"
function formatCount(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return String(rounded);
}

// "Oct 11–17", or "Sep 28–Oct 4" across a month.
function formatStretch(end: string) {
  const start = addDays(end, -6);
  const month = (date: string) =>
    new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", { timeZone: "UTC", month: "short" });
  const day = (date: string) => Number(date.slice(8));
  return month(start) === month(end)
    ? `${month(start)} ${day(start)}–${day(end)}`
    : `${month(start)} ${day(start)}–${month(end)} ${day(end)}`;
}

// The top of the Stats tab: what you've done lately across all exercises.
// Everything compares against the device's date, so it renders once that's
// known.
export function StatsOverview({ overview }: { overview: Overview }) {
  const today = useLocalToday();
  if (!today || overview.exercises.length === 0) return null;

  const muscleOf = new Map(overview.exercises.map((e) => [e.id, e.muscleGroup]));
  return (
    <>
      <MuscleSets rows={setsByMuscle(overview.entries, muscleOf, today)} />
      <RecentBests bests={recentBests(overview.entries, overview.exercises, today)} today={today} />
      <DaysLifted weeks={daysLiftedByWeek(overview.entries, today)} />
    </>
  );
}

// One bar per muscle group for the last 7 days, then "usually N": the weekly
// average over the 4 weeks before, rounded, so "less than usual" shows
// without targets.
function MuscleSets({ rows }: { rows: { group: MuscleGroup; recent: number; average: number }[] }) {
  const scale = Math.max(1, ...rows.map((r) => r.recent));

  return (
    <section className="flex flex-col gap-2">
      <h2 className={headingClass}>Sets per muscle · last 7 days</h2>
      <div className={cardClass}>
        {rows.length === 0 ? (
          <p className="text-sm text-zinc-500">Nothing logged in the last 5 weeks.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rows.map((row) => (
              <li
                key={row.group}
                className="grid grid-cols-[5.5rem_1fr_1.5rem_5rem] items-center gap-2 text-sm"
              >
                <span className="truncate text-zinc-950 dark:text-zinc-50">
                  {MUSCLE_GROUP_LABELS[row.group]}
                </span>
                <span className="h-4" aria-hidden>
                  {row.recent > 0 && (
                    <span
                      className="block h-full rounded-r bg-blue-600 dark:bg-blue-500"
                      style={{ width: `${(row.recent / scale) * 100}%` }}
                    />
                  )}
                </span>
                <span className="text-right font-semibold text-zinc-950 tabular-nums dark:text-zinc-50">
                  {row.recent}
                  <span className="sr-only"> sets,</span>
                </span>
                <span className="text-zinc-500 tabular-nums">usually {Math.round(row.average)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RecentBests({ bests, today }: { bests: ReturnType<typeof recentBests>; today: string }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className={headingClass}>New bests · last {BEST_WINDOW_DAYS} days</h2>
      {bests.length === 0 ? (
        <p className={`${cardClass} text-sm text-zinc-500`}>
          None in the last {BEST_WINDOW_DAYS} days.
        </p>
      ) : (
        <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {bests.map((best) => (
            <li key={best.exerciseId}>
              <Link
                href={`/stats/${best.exerciseId}`}
                className="flex items-center gap-3 px-3 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-zinc-950 dark:text-zinc-50">{best.name}</span>
                  <span className="block text-sm">
                    <EntryText entry={best} />
                    <span className="text-zinc-500">
                      {" · "}
                      {best.date === today ? "Today" : formatDay(best.date, today)}
                    </span>
                  </span>
                </span>
                <ChevronRight className="size-5 shrink-0 text-zinc-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-zinc-500">
        Your highest estimated strength on an exercise so far, from weight or reps.
      </p>
    </section>
  );
}

// Columns for days lifted in each of the last 12 weeks (7-day stretches
// ending today). Tap one to see its dates.
function DaysLifted({ weeks }: { weeks: { end: string; days: number }[] }) {
  const [active, setActive] = useState<number | null>(null);
  const last = weeks.length - 1;
  const earlier = weeks.slice(0, last);
  const average = earlier.reduce((sum, w) => sum + w.days, 0) / earlier.length;
  const plural = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

  return (
    <section className="flex flex-col gap-2">
      <h2 className={headingClass}>Days lifted · last 12 weeks</h2>
      <div className={cardClass}>
        <p className="text-sm text-zinc-950 dark:text-zinc-50" aria-live="polite">
          {active === null ? (
            <>
              <span className="font-semibold">{plural(weeks[last].days)}</span> in the last 7
              <span className="text-zinc-500"> · {formatCount(average)} a week before that</span>
            </>
          ) : (
            <>
              <span className="font-semibold">{plural(weeks[active].days)}</span>
              <span className="text-zinc-500">
                {" "}
                · {active === last ? "Last 7 days" : formatStretch(weeks[active].end)}
              </span>
            </>
          )}
        </p>
        <div className="mt-3 flex h-24 items-end border-b border-zinc-200 dark:border-zinc-800">
          {weeks.map((week, i) => (
            <button
              key={week.end}
              type="button"
              aria-label={`${i === last ? "Last 7 days" : formatStretch(week.end)}: ${plural(week.days)}`}
              aria-pressed={active === i}
              onClick={() => setActive(active === i ? null : i)}
              className="flex h-full flex-1 items-end justify-center px-px"
            >
              <span
                className={`w-full max-w-6 rounded-t ${
                  i === (active ?? last)
                    ? "bg-blue-600 dark:bg-blue-500"
                    : "bg-blue-200 dark:bg-blue-900"
                }`}
                style={{ height: `${(week.days / 7) * 100}%` }}
              />
            </button>
          ))}
        </div>
        <div className="mt-1 flex justify-between text-xs text-zinc-500">
          <span>{formatStretch(weeks[0].end)}</span>
          <span>Last 7 days</span>
        </div>
      </div>
    </section>
  );
}
