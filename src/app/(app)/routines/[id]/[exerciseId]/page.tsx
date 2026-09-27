import { ChartLine } from "lucide-react";
import { notFound } from "next/navigation";

import { ExerciseLog } from "@/components/entries/exercise-log";
import { ExerciseMeta } from "@/components/exercises/exercise-meta";
import { Screen, ScreenAction } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { getExerciseFromParam } from "@/lib/exercises";
import { getRoutine } from "@/lib/routines";

// Logging an exercise from within a routine: same as the Log tab's screen, but
// "back" returns to the routine.
export default async function RoutineExercisePage({
  params,
}: PageProps<"/routines/[id]/[exerciseId]">) {
  const user = await requireUser();
  const { id, exerciseId } = await params;
  const [routine, exercise] = await Promise.all([
    getRoutine(user.id, Number(id) || 0),
    getExerciseFromParam(user.id, exerciseId),
  ]);
  if (!routine || !exercise) notFound();

  return (
    <Screen
      title={exercise.name}
      back={{ href: `/routines/${routine.id}`, label: routine.name }}
      action={
        <ScreenAction href={`/stats/${exercise.id}`} label="Stats">
          <ChartLine className="size-6" aria-hidden />
        </ScreenAction>
      }
    >
      <div className="flex flex-col gap-4">
        <ExerciseMeta exercise={exercise} />
        <ExerciseLog userId={user.id} exerciseId={exercise.id} />
      </div>
    </Screen>
  );
}
