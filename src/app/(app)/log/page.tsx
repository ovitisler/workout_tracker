import type { Metadata } from "next";

import { ExercisePicker } from "@/components/exercises/exercise-picker";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listExercises } from "@/lib/exercises";

export const metadata: Metadata = { title: "Log · Workout Tracker" };

export default async function LogPage() {
  const user = await requireUser();
  return (
    <Screen title="Log">
      <ExercisePicker exercises={await listExercises(user.id)} mode={{ tab: "log" }} />
    </Screen>
  );
}
