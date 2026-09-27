import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Screen } from "@/components/screen";
import { LoggedExercises } from "@/components/stats/logged-exercises";
import { requireUser } from "@/lib/auth";
import { listRecentExercises } from "@/lib/entries";

export const metadata: Metadata = { title: "Stats · Workout Tracker" };

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  // Old `/stats?exercise=<id>` links.
  const { exercise } = await searchParams;
  if (typeof exercise === "string") redirect(`/stats/${exercise}`);

  const user = await requireUser();
  return (
    <Screen title="Stats">
      <LoggedExercises exercises={await listRecentExercises(user.id)} />
    </Screen>
  );
}
