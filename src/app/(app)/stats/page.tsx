import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ExercisePicker } from "@/components/exercises/exercise-picker";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listExercises } from "@/lib/exercises";

export const metadata: Metadata = { title: "Stats · Workout Tracker" };

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  // Old `/stats?exercise=<id>` links.
  const { exercise } = await searchParams;
  if (typeof exercise === "string") redirect(`/stats/${exercise}`);

  const user = await requireUser();
  return (
    <Screen title="Stats">
      <ExercisePicker exercises={await listExercises(user.id)} mode={{ tab: "stats" }} />
    </Screen>
  );
}
