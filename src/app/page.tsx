import Link from "next/link";

import { AppShell, SelectedExercise } from "@/app/app-shell";
import { EntryRow } from "@/app/entries/entry-row";
import { LogForm } from "@/app/entries/log-form";
import { ExercisePicker } from "@/app/exercises/exercise-picker";
import { requireUser } from "@/lib/auth";
import { listEntries } from "@/lib/entries";
import { formatDay, groupByDate, localToday } from "@/lib/entry-format";
import { getSelectedExercise, listExercises } from "@/lib/exercises";
import { getRoutine } from "@/lib/routines";

export default async function Home({ searchParams }: PageProps<"/">) {
  const user = await requireUser();
  const params = await searchParams;
  const selected = await getSelectedExercise(user.id, params.exercise);
  // Opened from a routine: link back to it.
  const routineId = Number(params.routine);
  const routine =
    selected && Number.isInteger(routineId) ? await getRoutine(user.id, routineId) : undefined;

  return (
    <AppShell tab="log" exerciseId={selected?.id}>
      {selected ? (
        <div className="flex flex-col gap-4 pt-2">
          {routine && (
            <Link
              href={`/routines/${routine.id}`}
              className="text-sm font-medium text-zinc-600 underline dark:text-zinc-400"
            >
              ← {routine.name}
            </Link>
          )}
          <SelectedExercise exercise={selected} tab="log" />
          <ExerciseLog userId={user.id} exerciseId={selected.id} />
        </div>
      ) : (
        <ExercisePicker exercises={await listExercises(user.id)} mode={{ tab: "log" }} />
      )}
    </AppShell>
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
