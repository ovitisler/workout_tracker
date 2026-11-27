"use client";

import { useOptimistic, useTransition } from "react";

import { setShowNotes } from "./actions";

// An iOS-style switch row. It flips right away, while the save is in flight.
export function NotesToggle({ showNotes }: { showNotes: boolean }) {
  const [shown, setShown] = useOptimistic(showNotes);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={shown}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setShown(!shown);
          await setShowNotes(!shown);
        })
      }
      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left active:bg-zinc-100 dark:active:bg-zinc-800"
    >
      <span className="text-zinc-950 dark:text-zinc-50">Notes box</span>
      <span
        aria-hidden
        className={`flex h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors ${
          shown ? "bg-blue-600 dark:bg-blue-500" : "bg-zinc-300 dark:bg-zinc-700"
        }`}
      >
        <span
          className={`size-6 rounded-full bg-white shadow-sm transition-transform ${shown ? "translate-x-5" : ""}`}
        />
      </span>
    </button>
  );
}
