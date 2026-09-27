import { Dumbbell } from "lucide-react";
import { notFound } from "next/navigation";

import { ExerciseMeta } from "@/components/exercises/exercise-meta";
import { Screen, ScreenAction } from "@/components/screen";
import { StatsView } from "@/components/stats/stats-view";
import { requireUser } from "@/lib/auth";
import { listEntries } from "@/lib/entries";
import { localToday } from "@/lib/entry-format";
import { getExerciseFromParam } from "@/lib/exercises";

export default async function StatsExercisePage({ params }: PageProps<"/stats/[exerciseId]">) {
  const user = await requireUser();
  const exercise = await getExerciseFromParam(user.id, (await params).exerciseId);
  if (!exercise) notFound();

  return (
    <Screen
      title={exercise.name}
      back={{ href: "/stats", label: "Stats" }}
      action={
        <ScreenAction href={`/log/${exercise.id}`} label="Log">
          <Dumbbell className="size-6" aria-hidden />
        </ScreenAction>
      }
    >
      <div className="flex flex-col gap-4">
        <ExerciseMeta exercise={exercise} />
        <StatsView
          entries={await listEntries(user.id, exercise.id)}
          // Server (UTC) date; only used to place range boundaries, where a
          // day either way doesn't matter.
          today={localToday()}
        />
      </div>
    </Screen>
  );
}
