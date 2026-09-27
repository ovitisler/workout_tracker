"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState, useTransition } from "react";

import { checkSignUpEmail, requestAccess, signIn, type SignInState } from "./actions";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";

const primaryButton =
  "rounded-lg bg-blue-600 px-3 py-2.5 font-medium text-white disabled:opacity-50 dark:bg-blue-500";

const textLink = "font-medium text-blue-600 dark:text-blue-400";

const errorText = "text-sm text-red-600 dark:text-red-400";

// Which screen is showing. Creating an account asks for the email first and
// only asks for a password if that email is allowed to sign up.
type Step =
  | { name: "sign-in" }
  | { name: "sign-up-email" }
  | { name: "sign-up-password" }
  | { name: "has-account" }
  | { name: "request-access"; alreadyRequested: boolean };

const TITLES: Record<Step["name"], string> = {
  "sign-in": "Sign in",
  "sign-up-email": "Create account",
  "sign-up-password": "Create account",
  "has-account": "Welcome back",
  "request-access": "Request access",
};

export function SignInForm() {
  const [step, setStep] = useState<Step>({ name: "sign-in" });
  // Kept across screens so it only needs typing once.
  const [email, setEmail] = useState("");

  const goTo = (name: "sign-in" | "sign-up-email") =>
    setStep(name === "sign-in" ? { name } : { name });

  let screen: React.ReactNode;
  switch (step.name) {
    case "sign-in":
      screen = (
        <>
          <SignInStep email={email} onEmailChange={setEmail} />
          <SwitchLink prompt="New here?" label="Create an account" onClick={() => goTo("sign-up-email")} />
        </>
      );
      break;
    case "sign-up-email":
      screen = (
        <>
          <EmailStep
            email={email}
            onEmailChange={setEmail}
            onResult={(result) => {
              if (result === "allowed") setStep({ name: "sign-up-password" });
              else if (result === "has-account") setStep({ name: "has-account" });
              else setStep({ name: "request-access", alreadyRequested: result === "requested" });
            }}
          />
          <SwitchLink prompt="Have an account?" label="Sign in" onClick={() => goTo("sign-in")} />
        </>
      );
      break;
    case "sign-up-password":
      screen = (
        <PasswordStep
          email={email}
          onChangeEmail={() => goTo("sign-up-email")}
          // The email passed the check but sign-up was still refused (e.g. an
          // admin changed their mind in between).
          onRefused={() => setStep({ name: "request-access", alreadyRequested: false })}
        />
      );
      break;
    case "has-account":
      screen = (
        <div className="flex flex-col gap-4">
          <p className="text-zinc-700 dark:text-zinc-300">
            <span className="font-medium break-words">{email}</span> already has an account.
          </p>
          <button type="button" onClick={() => goTo("sign-in")} className={primaryButton}>
            Sign in
          </button>
          <SwitchLink label="Use a different email" onClick={() => goTo("sign-up-email")} />
        </div>
      );
      break;
    case "request-access":
      screen = (
        <RequestAccess
          email={email}
          alreadyRequested={step.alreadyRequested}
          onDifferentEmail={() => goTo("sign-up-email")}
          onBack={() => goTo("sign-in")}
        />
      );
      break;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <h2 className="text-center text-lg font-medium text-zinc-700 dark:text-zinc-300">
        {TITLES[step.name]}
      </h2>
      {screen}
    </div>
  );
}

function SwitchLink({
  prompt,
  label,
  onClick,
}: {
  prompt?: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
      {prompt && `${prompt} `}
      <button type="button" onClick={onClick} className={textLink}>
        {label}
      </button>
    </p>
  );
}

function EmailInput({
  email,
  onEmailChange,
  autoComplete,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  autoComplete: string;
}) {
  return (
    <input
      name="email"
      type="email"
      required
      autoComplete={autoComplete}
      placeholder="Email"
      value={email}
      onChange={(e) => onEmailChange(e.target.value)}
      className={inputClass}
    />
  );
}

function PasswordInput({ isNew }: { isNew: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name="password"
        type={show ? "text" : "password"}
        required
        minLength={8}
        // "new-password" lets the phone suggest and save a strong password.
        autoComplete={isNew ? "new-password" : "current-password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Password"
        aria-describedby={isNew ? "password-hint" : undefined}
        className={`${inputClass} pr-12`}
      />
      <button
        type="button"
        onClick={() => setShow((shown) => !shown)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-zinc-500 active:text-zinc-950 dark:active:text-zinc-50"
      >
        {show ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
      </button>
    </div>
  );
}

function SignInStep({
  email,
  onEmailChange,
}: {
  email: string;
  onEmailChange: (email: string) => void;
}) {
  const [state, formAction, pending] = useActionState(signIn, {});
  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <input type="hidden" name="intent" value="sign-in" />
      <EmailInput email={email} onEmailChange={onEmailChange} autoComplete="email" />
      <PasswordInput isNew={false} />
      {state.error && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}
      <button disabled={pending} className={primaryButton}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

// Create account, step 1: check the email before asking for a password.
function EmailStep({
  email,
  onEmailChange,
  onResult,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  onResult: (result: "allowed" | "has-account" | "requested" | "not-allowed") => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        startTransition(async () => {
          const result = await checkSignUpEmail(email);
          if (result === "invalid") setError("Enter a valid email.");
          else onResult(result);
        });
      }}
      className="flex w-full flex-col gap-3"
    >
      <EmailInput email={email} onEmailChange={onEmailChange} autoComplete="email" />
      {error && (
        <p role="alert" className={errorText}>
          {error}
        </p>
      )}
      <button disabled={pending} className={primaryButton}>
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}

// Create account, step 2: the email is allowed; choose a password.
function PasswordStep({
  email,
  onChangeEmail,
  onRefused,
}: {
  email: string;
  onChangeEmail: () => void;
  onRefused: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (prev: SignInState, formData: FormData) => {
      const result = await signIn(prev, formData);
      if (result.canRequestAccess) onRefused();
      return result;
    },
    {},
  );

  return (
    <form action={formAction} className="flex w-full flex-col gap-3">
      <input type="hidden" name="intent" value="sign-up" />
      {/* The email as a (visually hidden) username field, so password managers
          save the new password against it. They ignore type="hidden". */}
      <input
        type="email"
        name="email"
        value={email}
        readOnly
        autoComplete="username"
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />
      <p className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2.5 dark:bg-zinc-900">
        <span className="min-w-0 truncate text-zinc-950 dark:text-zinc-50">{email}</span>
        <button type="button" onClick={onChangeEmail} className={`${textLink} shrink-0 text-sm`}>
          Change
        </button>
      </p>
      <PasswordInput isNew />
      <p id="password-hint" className="-mt-1 px-1 text-xs text-zinc-500">
        Choose a password: at least 8 characters.
      </p>
      {state.error && !state.canRequestAccess && (
        <p role="alert" className={errorText}>
          {state.error}
        </p>
      )}
      <button disabled={pending} className={primaryButton}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}

// Shown when the email can't sign up: ask the owner to let it in.
function RequestAccess({
  email,
  alreadyRequested,
  onDifferentEmail,
  onBack,
}: {
  email: string;
  alreadyRequested: boolean;
  onDifferentEmail: () => void;
  onBack: () => void;
}) {
  const [state, formAction, pending] = useActionState(requestAccess, {});
  const message =
    state.message ??
    (alreadyRequested
      ? "You've already asked. Once you're approved, come back and create your account."
      : undefined);

  return (
    <div className="flex w-full flex-col gap-5">
      {message ? (
        <p role="status" className="rounded-lg bg-white p-4 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {message}
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-3">
          <p className="text-zinc-700 dark:text-zinc-300">
            This app is invite-only, and <span className="font-medium break-words">{email}</span> isn’t
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
            <p role="alert" className={errorText}>
              {state.error}
            </p>
          )}
          <button disabled={pending} className={primaryButton}>
            {pending ? "Sending…" : "Request access"}
          </button>
        </form>
      )}

      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        <button type="button" onClick={onDifferentEmail} className={textLink}>
          Use a different email
        </button>
        {" · "}
        <button type="button" onClick={onBack} className={textLink}>
          Back to sign in
        </button>
      </p>
    </div>
  );
}
