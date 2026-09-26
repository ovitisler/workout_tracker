"use client";

import { useActionState, useState, useTransition } from "react";

import { formatEntry } from "@/lib/entry-format";

import { deleteEntry, updateEntry, type EntryFormState } from "./actions";
import { EntryFields } from "./entry-fields";

type Entry = { id: number; date: string; sets: number | null; reps: number; weight: number };

export function EntryRow({ entry }: { entry: Entry }) {
  const [editing, setEditing] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [state, formAction, saving] = useActionState(
    async (prev: EntryFormState, formData: FormData) => {
      const result = await updateEntry(entry.id, prev, formData);
      if (result.ok) setEditing(false);
      return result;
    },
    {},
  );

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="w-full px-3 py-3 text-left text-zinc-950 active:bg-zinc-100 dark:text-zinc-50 dark:active:bg-zinc-800"
      >
        {formatEntry(entry)}
      </button>
    );
  }

  const busy = saving || deleting;

  return (
    <form action={formAction} className="flex flex-col gap-3 p-3">
      <EntryFields defaults={entry} />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          disabled={busy}
          className="flex-1 rounded-lg bg-zinc-950 px-3 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
        >
          Save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setEditing(false)}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2.5 font-medium text-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
        >
          Cancel
        </button>
      </div>
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          if (confirm(`Delete ${formatEntry(entry)}?`)) {
            startDelete(() => deleteEntry(entry.id));
          }
        }}
        className="text-sm text-red-600 underline disabled:opacity-50 dark:text-red-400"
      >
        Delete
      </button>
    </form>
  );
}
