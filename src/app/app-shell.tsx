import Link from "next/link";

import type { Exercise } from "@/lib/exercises";
import { MUSCLE_GROUP_LABELS } from "@/lib/muscle-groups";
import { TABS, tabPath, type Tab } from "@/lib/tabs";

import { signOut } from "./sign-in/actions";

// Header, Log/Stats tabs and page frame shared by the signed-in screens. The
// selected exercise carries over when switching tabs.
export function AppShell({
  tab,
  exerciseId,
  children,
}: {
  tab: Tab;
  exerciseId?: number;
  children: React.ReactNode;
}) {
  const query = exerciseId ? `?exercise=${exerciseId}` : "";

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex items-center justify-between px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Workouts
        </h1>
        <form action={signOut}>
          <button className="text-sm text-zinc-600 underline dark:text-zinc-400">
            Sign out
          </button>
        </form>
      </header>

      <nav className="mx-auto w-full max-w-lg px-4 pb-2">
        <div className="grid grid-cols-3 rounded-lg bg-zinc-200 p-1 dark:bg-zinc-800">
          {TABS.map((t) => (
            <Link
              key={t.tab}
              href={t.tab === "routines" ? t.path : t.path + query}
              aria-current={t.tab === tab ? "page" : undefined}
              className={
                t.tab === tab
                  ? "rounded-md bg-white py-1.5 text-center text-sm font-medium text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-zinc-50"
                  : "rounded-md py-1.5 text-center text-sm font-medium text-zinc-600 dark:text-zinc-400"
              }
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-8">{children}</main>
    </div>
  );
}

export function SelectedExercise({ exercise, tab }: { exercise: Exercise; tab: Tab }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-4 dark:bg-zinc-900">
      <div>
        <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
          {exercise.name}
        </p>
        <p className="text-sm text-zinc-500">
          {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
          {exercise.custom && " · Custom"}
        </p>
      </div>
      <Link
        href={tabPath(tab)}
        className="shrink-0 text-sm text-zinc-600 underline dark:text-zinc-400"
      >
        Change
      </Link>
    </div>
  );
}
