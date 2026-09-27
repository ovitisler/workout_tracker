import Link from "next/link";
import { notFound } from "next/navigation";

import { RoutineChecklist } from "@/components/routines/routine-checklist";
import { Screen, ScreenAction } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { getRoutine, listRoutineExercises } from "@/lib/routines";

export default async function RoutinePage({ params }: PageProps<"/routines/[id]">) {
  const user = await requireUser();
  const routine = await getRoutine(user.id, Number((await params).id) || 0);
  if (!routine) notFound();
  const items = await listRoutineExercises(user.id, routine.id);

  return (
    <Screen
      title={routine.name}
      back={{ href: "/routines", label: "Routines" }}
      action={
        <ScreenAction href={`/routines/${routine.id}/edit`} label="Edit">
          Edit
        </ScreenAction>
      }
    >
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No exercises yet.{" "}
          <Link href={`/routines/${routine.id}/edit`} className="underline">
            Add some
          </Link>
          .
        </p>
      ) : (
        <RoutineChecklist routineId={routine.id} items={items} />
      )}
    </Screen>
  );
}
