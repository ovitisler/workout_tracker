import { NewRoutineForm } from "@/components/routines/new-routine-form";
import { TemplatePicker } from "@/components/routines/template-picker";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";

export default async function NewRoutinePage() {
  await requireUser();
  return (
    <Screen title="New Routine" back={{ href: "/routines", label: "Routines" }}>
      <div className="flex flex-col gap-6">
        <NewRoutineForm />
        <section className="flex flex-col gap-2">
          <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            Or start from a template
          </h2>
          <TemplatePicker />
          <p className="px-1 text-xs text-zinc-500">
            Creates all the routines in the set, which you can then edit.
          </p>
        </section>
      </div>
    </Screen>
  );
}
