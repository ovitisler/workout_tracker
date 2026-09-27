import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/app/app-shell";
import { requireUser } from "@/lib/auth";
import { listExercises } from "@/lib/exercises";
import { getRoutine, listRoutineExercises } from "@/lib/routines";

import { RoutineChecklist } from "./routine-checklist";
import { RoutineEditor } from "./routine-editor";

export const metadata: Metadata = { title: "Routine · Workout Tracker" };

export default async function RoutinePage({ params, searchParams }: PageProps<"/routines/[id]">) {
  const user = await requireUser();
  const routineId = Number((await params).id);
  const routine = Number.isInteger(routineId) ? await getRoutine(user.id, routineId) : undefined;
  if (!routine) notFound();

  const editing = (await searchParams).edit === "1";
  const items = await listRoutineExercises(user.id, routine.id);

  return (
    <AppShell tab="routines">
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex items-center justify-between gap-3">
          <Link href="/routines" className="text-sm text-zinc-600 underline dark:text-zinc-400">
            ← Routines
          </Link>
          {!editing && (
            <Link
              href={`/routines/${routine.id}?edit=1`}
              className="text-sm text-zinc-600 underline dark:text-zinc-400"
            >
              Edit
            </Link>
          )}
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {routine.name}
        </h2>

        {editing ? (
          <RoutineEditor routine={routine} items={items} exercises={await listExercises(user.id)} />
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No exercises yet.{" "}
            <Link href={`/routines/${routine.id}?edit=1`} className="underline">
              Add some
            </Link>
            .
          </p>
        ) : (
          <RoutineChecklist routineId={routine.id} items={items} />
        )}
      </div>
    </AppShell>
  );
}
