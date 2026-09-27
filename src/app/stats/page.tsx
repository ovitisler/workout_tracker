import type { Metadata } from "next";

import { AppShell, SelectedExercise } from "@/app/app-shell";
import { ExercisePicker } from "@/app/exercises/exercise-picker";
import { requireUser } from "@/lib/auth";
import { listEntries } from "@/lib/entries";
import { localToday } from "@/lib/entry-format";
import { getSelectedExercise, listExercises } from "@/lib/exercises";

import { StatsView } from "./stats-view";

export const metadata: Metadata = { title: "Stats · Workout Tracker" };

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  const user = await requireUser();
  const selected = await getSelectedExercise(user.id, (await searchParams).exercise);

  return (
    <AppShell tab="stats" exerciseId={selected?.id}>
      {selected ? (
        <div className="flex flex-col gap-4 pt-2">
          <SelectedExercise exercise={selected} tab="stats" />
          <StatsView
            key={selected.id}
            entries={await listEntries(user.id, selected.id)}
            // Server (UTC) date; only used to place range boundaries, where a
            // day either way doesn't matter.
            today={localToday()}
          />
        </div>
      ) : (
        <ExercisePicker exercises={await listExercises(user.id)} tab="stats" />
      )}
    </AppShell>
  );
}
