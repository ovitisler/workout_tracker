import { notFound } from "next/navigation";

import { EditExerciseForm } from "@/components/exercises/edit-exercise-form";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { getCustomExercise } from "@/lib/exercises";

export default async function EditExercisePage({ params }: PageProps<"/settings/exercises/[id]">) {
  const user = await requireUser();
  const exercise = await getCustomExercise(user.id, Number((await params).id) || 0);
  if (!exercise) notFound();

  return (
    <Screen title="Edit Exercise" back={{ href: "/settings/exercises", label: "Exercises" }}>
      <EditExerciseForm exercise={exercise} />
    </Screen>
  );
}
