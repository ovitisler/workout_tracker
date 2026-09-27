import { notFound } from "next/navigation";

import { RoutineEditor } from "@/components/routines/routine-editor";
import { Screen, ScreenAction } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listExercises } from "@/lib/exercises";
import { getRoutine, listRoutineExercises } from "@/lib/routines";

export default async function EditRoutinePage({ params }: PageProps<"/routines/[id]/edit">) {
  const user = await requireUser();
  const routine = await getRoutine(user.id, Number((await params).id) || 0);
  if (!routine) notFound();

  // Changes save as you make them, so there's just "Done".
  return (
    <Screen
      title="Edit Routine"
      action={
        <ScreenAction href={`/routines/${routine.id}`} label="Done">
          <span className="font-semibold">Done</span>
        </ScreenAction>
      }
    >
      <RoutineEditor
        routine={routine}
        items={await listRoutineExercises(user.id, routine.id)}
        exercises={await listExercises(user.id)}
      />
    </Screen>
  );
}
