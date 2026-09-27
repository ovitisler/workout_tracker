"use client";

import { useState } from "react";

import { formatDay, formatEntry, formatWeight } from "@/lib/entry-format";
import {
  bestDay,
  daysInRange,
  rangeStart,
  RANGES,
  strengthTrend,
  summarizeDays,
  toDayNumber,
  type Range,
  type Trend,
} from "@/lib/stats";

import { LineChart } from "./line-chart";

type Entry = { date: string; sets: number | null; reps: number; weight: number };

const RANGE_NAMES: Record<Range, string> = {
  "3M": "last 3 months",
  "6M": "last 6 months",
  "1Y": "last year",
  All: "all time",
};

function trendText(trend: Trend | null) {
  if (!trend) return { value: "—", note: "Not enough data yet" };
  const percent = `${Math.round(Math.abs(trend.change) * 100)}%`;
  switch (trend.direction) {
    case "up":
      return { value: `↑ ${percent}`, note: "Est. strength" };
    case "down":
      return { value: `↓ ${percent}`, note: "Est. strength" };
    case "flat":
      return { value: "→ Flat", note: "Est. strength" };
  }
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-lg bg-white p-3 dark:bg-zinc-900">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="truncate text-lg font-semibold text-zinc-950 dark:text-zinc-50">{value}</span>
      <span className="truncate text-xs text-zinc-500">{note}</span>
    </div>
  );
}

export function StatsView({ entries, today }: { entries: Entry[]; today: string }) {
  const [range, setRange] = useState<Range>("6M");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const allDays = summarizeDays(entries);
  const days = daysInRange(allDays, range, today);
  const start = rangeStart(range, today) ?? allDays[0]?.date ?? today;
  const xDomain: [number, number] = [toDayNumber(start), toDayNumber(today)];

  const selectRange = (next: Range) => {
    setRange(next);
    setActiveIndex(null);
  };

  const rangeButtons = (
    <div className="grid grid-cols-4 rounded-lg bg-zinc-200 p-0.5 dark:bg-zinc-800" role="group" aria-label="Time range">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={r === range}
          onClick={() => selectRange(r)}
          className={
            r === range
              ? "rounded-md bg-white py-1.5 text-sm font-semibold text-zinc-950 shadow-sm dark:bg-zinc-600 dark:text-zinc-50"
              : "rounded-md py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-300"
          }
        >
          {r}
        </button>
      ))}
    </div>
  );

  if (allDays.length === 0) {
    return (
      <p className="pt-2 text-center text-sm text-zinc-500">
        Nothing logged for this exercise yet. Log some sets on the Log tab and your stats will show up here.
      </p>
    );
  }

  if (days.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        {rangeButtons}
        <p className="text-center text-sm text-zinc-500">
          Nothing logged in the {RANGE_NAMES[range]}.
        </p>
      </div>
    );
  }

  const trend = trendText(strengthTrend(days));
  const best = bestDay(days)!;
  const index = activeIndex ?? days.length - 1;
  const active = days[index];

  return (
    <div className="flex flex-col gap-4">
      {rangeButtons}

      <div className="grid grid-cols-3 gap-2">
        <Tile label="Trend" value={trend.value} note={trend.note} />
        <Tile label="Best" value={`${formatWeight(best.weight)} × ${best.reps}`} note={formatDay(best.date, today)} />
        <Tile label="Sessions" value={String(days.length)} note={RANGE_NAMES[range]} />
      </div>

      {/* The readout for the crosshair: tap or drag on either chart. */}
      <div className="rounded-lg bg-white px-3 py-2 dark:bg-zinc-900" aria-live="polite">
        <span className="text-sm font-medium text-zinc-950 dark:text-zinc-50">{formatEntry(active)}</span>
        <span className="text-sm text-zinc-500">
          {" "}· ≈ {Math.round(active.strength)} est. · {formatDay(active.date, today)}
        </span>
      </div>

      <section className="flex flex-col gap-1 rounded-lg bg-white p-3 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Estimated strength (lb)</h2>
        <p className="text-xs text-zinc-500">
          Your estimated 1-rep max: weight and reps in one number, so it goes up when either does.
        </p>
        <LineChart
          label={`Estimated one-rep max per day, ${RANGE_NAMES[range]}`}
          points={days.map((d) => ({ x: toDayNumber(d.date), y: Math.round(d.strength) }))}
          xDomain={xDomain}
          formatY={(v) => String(Math.round(v))}
          activeIndex={index}
          onActiveIndexChange={setActiveIndex}
        />
      </section>

      <section className="flex flex-col gap-1 rounded-lg bg-white p-3 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">Top weight (lb)</h2>
        <LineChart
          label={`Top weight per day, ${RANGE_NAMES[range]}`}
          points={days.map((d) => ({ x: toDayNumber(d.date), y: d.weight }))}
          xDomain={xDomain}
          formatY={formatWeight}
          activeIndex={index}
          onActiveIndexChange={setActiveIndex}
        />
      </section>

      <p className="text-xs text-zinc-500">
        Estimated strength uses the Epley formula (weight × (1 + reps ÷ 30)). Every entry is listed on
        the Log tab.
      </p>
    </div>
  );
}
