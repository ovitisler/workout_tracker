import { Plus } from "lucide-react";
import type { Metadata } from "next";

import { RoutineList } from "@/components/routines/routine-list";
import { Screen, ScreenAction } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listRoutines } from "@/lib/routines";

export const metadata: Metadata = { title: "Routines · Workout Tracker" };

export default async function RoutinesPage() {
  const user = await requireUser();
  return (
    <Screen
      title="Routines"
      action={
        <ScreenAction href="/routines/new" label="New routine">
          <Plus className="size-6" aria-hidden />
        </ScreenAction>
      }
    >
      <RoutineList routines={await listRoutines(user.id)} />
    </Screen>
  );
}
