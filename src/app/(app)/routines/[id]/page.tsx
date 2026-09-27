import { Pencil } from "lucide-react";
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
        <div className="flex flex-col gap-6">
          <RoutineChecklist routineId={routine.id} items={items} />
          <Link
            href={`/routines/${routine.id}/edit`}
            className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 py-3 font-medium text-zinc-950 active:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:active:bg-zinc-900"
          >
            <Pencil className="size-4" aria-hidden />
            Edit routine
          </Link>
          <p className="-mt-4 text-center text-xs text-zinc-500">
            Rename it, or add, remove and reorder exercises.
          </p>
        </div>
      )}
    </Screen>
  );
}
