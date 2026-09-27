import { NewRoutineForm } from "@/components/routines/new-routine-form";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";

export default async function NewRoutinePage() {
  await requireUser();
  return (
    <Screen title="New Routine" back={{ href: "/routines", label: "Routines" }}>
      <NewRoutineForm />
    </Screen>
  );
}
