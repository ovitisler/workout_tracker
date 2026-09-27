import type { Metadata } from "next";

import { AppShell } from "@/app/app-shell";
import { requireUser } from "@/lib/auth";
import { listRoutines } from "@/lib/routines";

import { RoutineList } from "./routine-list";

export const metadata: Metadata = { title: "Routines · Workout Tracker" };

export default async function RoutinesPage() {
  const user = await requireUser();
  return (
    <AppShell tab="routines">
      <RoutineList routines={await listRoutines(user.id)} />
    </AppShell>
  );
}
