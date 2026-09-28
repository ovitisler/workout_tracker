import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { listCustomExercises } from "@/lib/exercises";
import { MUSCLE_GROUP_LABELS } from "@/lib/muscle-groups";

export const metadata: Metadata = { title: "Custom Exercises · Workout Tracker" };

export default async function CustomExercisesPage() {
  const user = await requireUser();
  const exercises = await listCustomExercises(user.id);

  return (
    <Screen title="Custom Exercises" back={{ href: "/settings", label: "Settings" }}>
      <div className="flex flex-col gap-3">
        {exercises.length === 0 ? (
          <p className="text-zinc-600 dark:text-zinc-400">
            You haven’t added any exercises of your own. When one you do isn’t in the list, search
            for it on the Log tab or while editing a routine and tap <strong>+ Add</strong>.
          </p>
        ) : (
          <>
            <p className="text-sm text-zinc-500">Exercises you added. Tap one to rename or delete it.</p>
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  <Link
                    href={`/settings/exercises/${exercise.id}`}
                    className="flex items-center gap-3 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-zinc-950 dark:text-zinc-50">{exercise.name}</span>
                      <span className="block text-xs text-zinc-500">
                        {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                        {exercise.entryCount > 0 &&
                          ` · ${exercise.entryCount} ${exercise.entryCount === 1 ? "entry" : "entries"}`}
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-zinc-400" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Screen>
  );
}
