"use client";

import { useActionState } from "react";

import { signIn } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, {});

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <input
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="Email"
        defaultValue={state.email}
        className={inputClass}
      />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="current-password"
        placeholder="Password"
        className={inputClass}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        name="intent"
        value="sign-in"
        disabled={pending}
        className="rounded-lg bg-zinc-950 px-3 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950"
      >
        Sign in
      </button>
      <button
        name="intent"
        value="sign-up"
        disabled={pending}
        className="rounded-lg border border-zinc-300 px-3 py-2.5 font-medium text-zinc-950 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-50"
      >
        Create account
      </button>
    </form>
  );
}
