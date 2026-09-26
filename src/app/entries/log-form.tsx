"use client";

import { useActionState, useState } from "react";

import { createEntry, type EntryFormState } from "./actions";
import { EntryFields, type EntryDefaults } from "./entry-fields";

export function LogForm({
  exerciseId,
  latestId,
  defaults,
}: {
  exerciseId: number;
  latestId: number | undefined;
  defaults: EntryDefaults | null;
}) {
  // The fields reset (today's date, pre-filled from the latest entry) whenever
  // the latest entry changes, and after every save — the latter covers saving
  // a backdated entry, which doesn't change the latest one.
  const [saves, setSaves] = useState(0);
  const [state, formAction, pending] = useActionState(
    async (prev: EntryFormState, formData: FormData) => {
      const result = await createEntry(exerciseId, prev, formData);
      if (result.ok) setSaves((n) => n + 1);
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg bg-white p-4 dark:bg-zinc-900">
      <EntryFields key={`${latestId}-${saves}`} defaults={defaults} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-lg bg-zinc-950 px-3 py-3 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
