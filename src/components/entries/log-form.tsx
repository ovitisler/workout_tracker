"use client";

import { CircleCheck } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";

import { formatDay, formatEntry, type EntryValues } from "@/lib/entry-format";
import { useLocalToday } from "@/lib/use-local-today";

import { createEntry, type CreateEntryState } from "./actions";
import { EntryFields, type EntryDefaults } from "./entry-fields";

// The routine this exercise was opened from, for the "Next" button: its
// exercises in order, with each one's most recent log date.
export type RoutineContext = {
  id: number;
  items: { id: number; name: string; lastDate: string | null }[];
};

const primaryClass =
  "rounded-lg bg-blue-600 px-3 py-3 text-center font-medium text-white disabled:opacity-50 dark:bg-blue-500 dark:text-white";
const secondaryClass =
  "flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 text-center font-medium text-zinc-950 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:active:bg-zinc-800";

// The next exercise in the routine (after this one, wrapping around) that
// hasn't been logged today.
function nextInRoutine(routine: RoutineContext, exerciseId: number, today: string) {
  const index = routine.items.findIndex((item) => item.id === exerciseId);
  const after = [...routine.items.slice(index + 1), ...routine.items.slice(0, index)];
  const next = after.find((item) => item.id !== exerciseId && item.lastDate !== today);
  return next && { href: `/routines/${routine.id}/${next.id}`, name: next.name };
}

export function LogForm({
  exerciseId,
  latestId,
  defaults,
  doneHref,
  routine,
}: {
  exerciseId: number;
  latestId: number | undefined;
  defaults: EntryDefaults | null;
  doneHref: string;
  routine?: RoutineContext;
}) {
  const today = useLocalToday();
  // After a save the form gives way to a confirmation card; "Log another"
  // brings it back, pre-filled with what was just saved.
  const [saved, setSaved] = useState<EntryValues | null>(null);
  const [again, setAgain] = useState<EntryValues | null>(null);
  const [state, formAction, pending] = useActionState(
    async (prev: CreateEntryState, formData: FormData) => {
      const result = await createEntry(exerciseId, prev, formData);
      if (result.saved) setSaved(result.saved);
      return result;
    },
    {},
  );

  if (saved) {
    const next = routine && today ? nextInRoutine(routine, exerciseId, today) : undefined;
    return (
      <div role="status" className="flex flex-col gap-3 rounded-lg bg-white p-4 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <CircleCheck className="size-7 shrink-0 text-blue-600 dark:text-blue-500" aria-hidden />
          <div>
            <p className="font-semibold text-zinc-950 dark:text-zinc-50">
              Logged {formatEntry(saved)}
            </p>
            {today && saved.date !== today && (
              <p className="text-sm text-zinc-500">on {formatDay(saved.date, today)}</p>
            )}
          </div>
        </div>
        {next && (
          <Link href={next.href} className={primaryClass}>
            Next: {next.name} →
          </Link>
        )}
        <div className="flex gap-2">
          <Link href={doneHref} className={next ? secondaryClass : `${primaryClass} flex-1`}>
            Done
          </Link>
          <button
            type="button"
            onClick={() => {
              setAgain(saved);
              setSaved(null);
            }}
            className={secondaryClass}
          >
            Log another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg bg-white p-4 dark:bg-zinc-900">
      {/* The form unmounts while the card shows, so it comes back fresh. */}
      <EntryFields key={latestId} defaults={again ?? defaults} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={primaryClass}>
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
