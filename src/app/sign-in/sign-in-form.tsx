"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";

import { requestAccess, signIn, type SignInState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";

const primaryButton =
  "rounded-lg bg-blue-600 px-3 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-blue-500";

const textLink = "font-medium text-blue-600 dark:text-blue-400";

type Mode = "sign-in" | "sign-up";

// One thing at a time: the sign-in form, or the create-account form, or (when
// sign-up is refused because the email isn't allowed) the request-access form.
// Links underneath switch between them.
export function SignInForm() {
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  // Set when sign-up was refused: that email can request access instead.
  const [refusedEmail, setRefusedEmail] = useState<string | null>(null);

  if (refusedEmail) {
    return (
      <RequestAccess
        email={refusedEmail}
        onDifferentEmail={() => {
          setRefusedEmail(null);
          setEmail("");
          setMode("sign-up");
        }}
        onBack={() => {
          setRefusedEmail(null);
          setMode("sign-in");
        }}
      />
    );
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <h2 className="text-center text-lg font-medium text-zinc-700 dark:text-zinc-300">
        {mode === "sign-in" ? "Sign in" : "Create account"}
      </h2>
      {/* Keyed so switching modes clears errors from the other form. */}
      <CredentialsForm
        key={mode}
        mode={mode}
        email={email}
        onEmailChange={setEmail}
        onRefused={setRefusedEmail}
      />
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {mode === "sign-in" ? (
          <>
            New here?{" "}
            <button type="button" onClick={() => setMode("sign-up")} className={textLink}>
              Create an account
            </button>
          </>
        ) : (
          <>
            Have an account?{" "}
            <button type="button" onClick={() => setMode("sign-in")} className={textLink}>
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
}

function CredentialsForm({
  mode,
  email,
  onEmailChange,
  onRefused,
}: {
  mode: Mode;
  email: string;
  onEmailChange: (email: string) => void;
  onRefused: (email: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: SignInState, formData: FormData) => {
      const result = await signIn(prev, formData);
      if (result.canRequestAccess && result.email) onRefused(result.email);
      return result;
    },
    {},
  );
  const signingUp = mode === "sign-up";

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <input type="hidden" name="intent" value={mode} />
      <input
        name="email"
        type="email"
        required
        autoComplete={signingUp ? "username" : "email"}
        placeholder="Email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className={inputClass}
      />
      <div className="relative">
        <input
          name="password"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          // "new-password" lets the phone suggest and save a strong password.
          autoComplete={signingUp ? "new-password" : "current-password"}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Password"
          aria-describedby={signingUp ? "password-hint" : undefined}
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
      {signingUp && (
        <p id="password-hint" className="-mt-1 px-1 text-xs text-zinc-500">
          At least 8 characters.
        </p>
      )}
      {state.error && !state.canRequestAccess && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button disabled={pending} className={primaryButton}>
        {signingUp ? (pending ? "Creating account…" : "Create account") : pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

// Shown instead of the forms when sign-up is refused: ask the owner to let
// this email in.
function RequestAccess({
  email,
  onDifferentEmail,
  onBack,
}: {
  email: string;
  onDifferentEmail: () => void;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState(requestAccess, {});

  return (
    <div className="flex w-full flex-col gap-5">
      <h2 className="text-center text-lg font-medium text-zinc-700 dark:text-zinc-300">
        {state.message ? "Request sent" : "Request access"}
      </h2>

      {state.message ? (
        <p role="status" className="rounded-lg bg-white p-4 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {state.message}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <p className="text-zinc-700 dark:text-zinc-300">
            This app is invite-only, and <span className="font-medium break-all">{email}</span> isn’t
            on the list yet. Ask the owner to let you in:
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
          <button disabled={pending} className={primaryButton}>
            {pending ? "Sending…" : "Request access"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        {!state.message && (
          <>
            <button type="button" onClick={onDifferentEmail} className={textLink}>
              Use a different email
            </button>
            {" · "}
          </>
        )}
        <button type="button" onClick={onBack} className={textLink}>
          Back to sign in
        </button>
      </p>
    </div>
  );
}
