import type { Metadata } from "next";
import Link from "next/link";

import { ExercisePicker } from "@/components/exercises/exercise-picker";
import { RecentExercises } from "@/components/exercises/recent-exercises";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listRecentExercises } from "@/lib/entries";
import { listExercises } from "@/lib/exercises";

export const metadata: Metadata = { title: "Log · Workout Tracker" };

export default async function LogPage() {
  const user = await requireUser();
  const [exercises, recent] = await Promise.all([
    listExercises(user.id),
    listRecentExercises(user.id),
  ]);

  return (
    <Screen title="Log">
      <p className="text-zinc-600 dark:text-zinc-400">Pick an exercise to record what you lifted.</p>
      <ExercisePicker
        exercises={exercises}
        mode={{ tab: "log" }}
        top={
          <RecentExercises
            recent={recent}
            basePath="/log"
            emptyHint={
              <>
                Exercises you log will show up here, so you can find them fast. Doing the same ones
                each session? Make a{" "}
                <Link href="/routines" className="font-medium text-blue-600 dark:text-blue-400">
                  routine
                </Link>
                .
              </>
            }
          />
        }
      />
    </Screen>
  );
}
