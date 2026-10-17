import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { Screen } from "@/components/screen";
import { LoggedExercises } from "@/components/stats/logged-exercises";
import { StatsOverview } from "@/components/stats/stats-overview";
import { requireUser } from "@/lib/auth";
import { getOverview, listRecentExercises } from "@/lib/entries";

export const metadata: Metadata = { title: "Stats · Workout Tracker" };

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  // Old `/stats?exercise=<id>` links.
  const { exercise } = await searchParams;
  if (typeof exercise === "string") redirect(`/stats/${exercise}`);

  const user = await requireUser();
  const [overview, exercises] = await Promise.all([
    getOverview(user.id),
    listRecentExercises(user.id),
  ]);
  return (
    <Screen title="Stats">
      <div className="flex flex-col gap-6">
        <StatsOverview overview={overview} />
        <LoggedExercises exercises={exercises} />
      </div>
    </Screen>
  );
}
