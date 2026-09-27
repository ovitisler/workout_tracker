import { ChartLine } from "lucide-react";
import { notFound } from "next/navigation";

import { ExerciseLog } from "@/components/entries/exercise-log";
import { ExerciseMeta } from "@/components/exercises/exercise-meta";
import { Screen, ScreenAction } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { getExerciseFromParam } from "@/lib/exercises";

export default async function LogExercisePage({ params }: PageProps<"/log/[exerciseId]">) {
  const user = await requireUser();
  const exercise = await getExerciseFromParam(user.id, (await params).exerciseId);
  if (!exercise) notFound();

  return (
    <Screen
      title={exercise.name}
      back={{ href: "/log", label: "Log" }}
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
