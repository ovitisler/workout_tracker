import type { Exercise } from "@/lib/exercises";
import { MUSCLE_GROUP_LABELS } from "@/lib/muscle-groups";

// "Chest · Custom" under an exercise screen's title.
export function ExerciseMeta({ exercise }: { exercise: Exercise }) {
  return (
    <p className="text-sm text-zinc-500">
      {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
      {exercise.custom && " · Custom"}
    </p>
  );
}
