"use client";

import { useActionState } from "react";

import { createRoutine } from "./actions";

export function NewRoutineForm() {
  const [state, formAction, pending] = useActionState(createRoutine, {});
  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          name="name"
          required
          maxLength={40}
          placeholder="e.g. Lower 1"
          autoFocus
          aria-label="New routine name"
          autoComplete="off"
          className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50"
        />
        <button
          disabled={pending}
          className="shrink-0 rounded-lg bg-blue-600 px-4 font-medium text-white disabled:opacity-50 dark:bg-blue-500 dark:text-white"
        >
          Create
        </button>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
