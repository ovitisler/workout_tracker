import Link from "next/link";

import type { Exercise } from "@/lib/exercises";
import { MUSCLE_GROUP_LABELS } from "@/lib/muscle-groups";

// "Chest · Custom · Edit" under an exercise screen's title. Only custom
// exercises can be edited.
export function ExerciseMeta({ exercise }: { exercise: Exercise }) {
  return (
    <p className="text-sm text-zinc-500">
      {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
      {exercise.custom && (
        <>
          {" · Custom · "}
          <Link
            href={`/settings/exercises/${exercise.id}`}
            className="font-medium text-blue-600 dark:text-blue-400"
          >
            Edit
          </Link>
        </>
      )}
    </p>
  );
}
