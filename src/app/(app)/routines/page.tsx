import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { RoutineList } from "@/components/routines/routine-list";
import { TodaysWorkouts } from "@/components/routines/todays-workouts";
import { Screen, ScreenAction } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listRecentEntries } from "@/lib/entries";
import { findTemplate } from "@/lib/routine-templates";
import { listRoutines } from "@/lib/routines";

export const metadata: Metadata = { title: "Routines · Workout Tracker" };

export default async function RoutinesPage({ searchParams }: PageProps<"/routines">) {
  const user = await requireUser();
  // Just added from a template (see createRoutinesFromTemplate).
  const { added } = await searchParams;
  const addedTemplate = typeof added === "string" ? findTemplate(added) : undefined;
  const [routines, recentEntries] = await Promise.all([
    listRoutines(user.id),
    listRecentEntries(user.id),
  ]);
  return (
    <Screen
      title="Routines"
      action={
        <ScreenAction href="/routines/new" label="New routine">
          <Plus className="size-6" aria-hidden />
        </ScreenAction>
      }
    >
      <div className="flex flex-col gap-6">
        <RoutineList routines={routines} justAdded={addedTemplate?.routines.map((r) => r.name)} />
        <TodaysWorkouts entries={recentEntries} />
      </div>
    </Screen>
  );
}
