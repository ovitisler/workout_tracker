import Link from "next/link";

import { ExercisePicker } from "@/app/exercises/exercise-picker";
import { requireUser } from "@/lib/auth";
import { getExercise, listExercises } from "@/lib/exercises";
import { MUSCLE_GROUP_LABELS } from "@/lib/muscle-groups";

import { signOut } from "./sign-in/actions";

export default async function Home({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const exerciseId = Number((await searchParams).exercise);
  const selected = Number.isInteger(exerciseId)
    ? await getExercise(user.id, exerciseId)
    : undefined;

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

      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-8">
        {selected ? (
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex items-start justify-between gap-3 rounded-lg bg-white p-4 dark:bg-zinc-900">
              <div>
                <p className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                  {selected.name}
                </p>
                <p className="text-sm text-zinc-500">
                  {MUSCLE_GROUP_LABELS[selected.muscleGroup]}
                  {selected.custom && " · Custom"}
                </p>
              </div>
              <Link
                href="/"
                className="shrink-0 text-sm text-zinc-600 underline dark:text-zinc-400"
              >
                Change
              </Link>
            </div>
            <p className="text-center text-sm text-zinc-500">
              History and logging are coming next.
            </p>
          </div>
        ) : (
          <ExercisePicker exercises={await listExercises(user.id)} />
        )}
      </main>
    </div>
  );
}
