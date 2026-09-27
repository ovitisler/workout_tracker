"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";

import { requestAccess, signIn } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";

export function SignInForm() {
  const [state, formAction, pending] = useActionState(signIn, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6">
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
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="current-password"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="Password"
            className={`${inputClass} pr-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((shown) => !shown)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-500 active:text-zinc-950 dark:active:text-zinc-50"
          >
            {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
          </button>
        </div>
        {state.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {state.error}
          </p>
        )}
        <button
          name="intent"
          value="sign-in"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-3 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-blue-500 dark:text-white"
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
      {state.canRequestAccess && state.email && (
        <RequestAccess key={state.email} email={state.email} />
      )}
    </div>
  );
}

// Shown when sign-up is refused: ask the owner to let this email in.
function RequestAccess({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(requestAccess, {});

  if (state.message) {
    return (
      <p role="status" className="rounded-lg bg-white p-4 text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
        {state.message}
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg bg-white p-4 dark:bg-zinc-900">
      <p className="text-sm text-zinc-700 dark:text-zinc-300">
        Want in? Ask the owner to approve <span className="font-medium">{email}</span>.
      </p>
      <input type="hidden" name="email" value={email} />
      <input
        name="note"
        maxLength={200}
        placeholder="Note (optional), e.g. who you are"
        aria-label="Note for the owner (optional)"
        autoComplete="off"
        className={inputClass}
      />
      {state.error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-lg bg-blue-600 px-3 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-blue-500 dark:text-white"
      >
        {pending ? "Sending…" : "Request access"}
      </button>
    </form>
  );
}
