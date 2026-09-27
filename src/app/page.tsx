import Link from "next/link";

import { EntryRow } from "@/app/entries/entry-row";
import { LogForm } from "@/app/entries/log-form";
import { ExercisePicker } from "@/app/exercises/exercise-picker";
import { requireUser } from "@/lib/auth";
import { listEntries } from "@/lib/entries";
import { formatDay, groupByDate, localToday } from "@/lib/entry-format";
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
            <ExerciseLog userId={user.id} exerciseId={selected.id} />
          </div>
        ) : (
          <ExercisePicker exercises={await listExercises(user.id)} />
        )}
      </main>
    </div>
  );
}

async function ExerciseLog({
  userId,
  exerciseId,
}: {
  userId: string;
  exerciseId: number;
}) {
  const history = await listEntries(userId, exerciseId);
  // Pre-fill from the first entry of the most recent day: usually the main
  // working sets rather than a last, weaker set.
  const latest = history[0];
  // Only used to decide whether to show the year on old entries.
  const today = localToday();

  return (
    <>
      <LogForm
        key={exerciseId}
        exerciseId={exerciseId}
        latestId={latest?.id}
        defaults={
          latest
            ? { sets: latest.sets, reps: latest.reps, weight: latest.weight }
            : null
        }
      />

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
          History
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Nothing logged yet. Your entries will show up here.
          </p>
        ) : (
          groupByDate(history).map((group) => (
            <div key={group.date}>
              <h3 className="mb-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {formatDay(group.date, today)}
              </h3>
              <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
                {group.entries.map((entry) => (
                  <li key={entry.id}>
                    <EntryRow entry={entry} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}
