"use client";

import { useState } from "react";

import { formatWeight } from "@/lib/entry-format";
import { useLocalToday } from "@/lib/use-local-today";

export type EntryDefaults = {
  date?: string;
  sets: number | null;
  reps: number;
  weight: number;
};

const inputClass =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-2.5 text-center text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";

const stepButtonClass =
  "shrink-0 rounded-lg border border-zinc-300 px-3 text-lg text-zinc-950 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:active:bg-zinc-800";

function step(value: string, delta: number, min: number) {
  const number = Number(value || 0);
  if (Number.isNaN(number)) return value;
  return formatWeight(Math.max(min, number + delta));
}

function Stepper({
  label,
  name,
  value,
  onChange,
  delta,
  min,
  inputMode,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  delta: number;
  min: number;
  inputMode: "numeric" | "decimal";
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-500">{label}</span>
      <div className="flex gap-1">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => onChange(step(value, -delta, min))}
          className={stepButtonClass}
        >
          −
        </button>
        <input
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputMode={inputMode}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClass}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => onChange(step(value, delta, min))}
          className={stepButtonClass}
        >
          +
        </button>
      </div>
    </label>
  );
}

export function EntryFields({ defaults }: { defaults: EntryDefaults | null }) {
  const today = useLocalToday();
  const [date, setDate] = useState(defaults?.date);
  const [weight, setWeight] = useState(defaults ? formatWeight(defaults.weight) : "");
  const [reps, setReps] = useState(defaults ? String(defaults.reps) : "");
  const [sets, setSets] = useState(defaults?.sets ? String(defaults.sets) : "");

  return (
    <div className="flex flex-col gap-3">
      <Stepper
        label="Weight (lb)"
        name="weight"
        value={weight}
        onChange={setWeight}
        delta={5}
        min={0}
        inputMode="decimal"
      />
      <div className="grid grid-cols-2 gap-3">
        <Stepper
          label="Reps"
          name="reps"
          value={reps}
          onChange={setReps}
          delta={1}
          min={1}
          inputMode="numeric"
        />
        <Stepper
          label="Sets"
          name="sets"
          value={sets}
          onChange={setSets}
          delta={1}
          min={1}
          inputMode="numeric"
          placeholder="1"
        />
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Date</span>
        <input
          type="date"
          name="date"
          value={date ?? today}
          onChange={(e) => setDate(e.target.value)}
          required
          className={`${inputClass} text-left`}
        />
      </label>
    </div>
  );
}
