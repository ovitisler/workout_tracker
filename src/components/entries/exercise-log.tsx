import { EntryRow } from "@/components/entries/entry-row";
import { LogForm } from "@/components/entries/log-form";
import { listEntries } from "@/lib/entries";
import { formatDay, groupByDate, localToday } from "@/lib/entry-format";

// The log screen for one exercise: the pre-filled form and the history.
export async function ExerciseLog({
  userId,
  exerciseId,
  exerciseName,
}: {
  userId: string;
  exerciseId: number;
  exerciseName: string;
}) {
  const history = await listEntries(userId, exerciseId);
  // Pre-fill from the first entry of the most recent day: usually the main
  // working sets rather than a last, weaker set.
  const latest = history[0];
  // Only used to decide whether to show the year on old entries.
  const today = localToday();

  return (
    <>
      {!latest && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-950 dark:bg-blue-950 dark:text-blue-100">
          <p className="font-semibold">First time logging {exerciseName}</p>
          <p>
            Enter the weight and reps you did (and how many sets) and tap{" "}
            <span className="font-semibold">Save</span>. Next time, the form is filled in with what
            you did last, so you just adjust and save.
          </p>
        </div>
      )}
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
