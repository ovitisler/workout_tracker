import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ExercisePicker } from "@/components/exercises/exercise-picker";
import { RecentExercises } from "@/components/exercises/recent-exercises";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listRecentExercises } from "@/lib/entries";
import { listExercises } from "@/lib/exercises";

export const metadata: Metadata = { title: "Stats · Workout Tracker" };

export default async function StatsPage({ searchParams }: PageProps<"/stats">) {
  // Old `/stats?exercise=<id>` links.
  const { exercise } = await searchParams;
  if (typeof exercise === "string") redirect(`/stats/${exercise}`);

  const user = await requireUser();
  const [exercises, recent] = await Promise.all([
    listExercises(user.id),
    listRecentExercises(user.id),
  ]);

  return (
    <Screen title="Stats">
      <p className="text-zinc-600 dark:text-zinc-400">
        Pick an exercise to see whether you’re getting stronger.
      </p>
      <ExercisePicker
        exercises={exercises}
        mode={{ tab: "stats" }}
        top={
          <RecentExercises
            recent={recent}
            basePath="/stats"
            emptyHint="Exercises you’ve logged will show up here. Log a few sessions and you’ll see charts of your progress."
          />
        }
      />
    </Screen>
  );
}
