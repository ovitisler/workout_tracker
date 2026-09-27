import { notFound } from "next/navigation";

import { AddTemplateButton } from "@/components/routines/add-template-button";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";
import { findTemplate } from "@/lib/routine-templates";

// Preview of a template: what it adds, before anything is created.
export default async function TemplatePage({ params }: PageProps<"/routines/templates/[id]">) {
  await requireUser();
  const template = findTemplate((await params).id);
  if (!template) notFound();
  const count = template.routines.length;

  return (
    <Screen title={template.name} back={{ href: "/routines", label: "Routines" }}>
      <div className="flex flex-col gap-4">
        <p className="text-zinc-600 dark:text-zinc-400">
          Adds {count} routines to your list, with these exercises. You can rename them, reorder,
          add or remove exercises afterwards.
        </p>

        {template.routines.map((routine) => (
          <section key={routine.name} className="flex flex-col gap-1">
            <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {routine.name}
            </h2>
            <ol className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
              {routine.exercises.map((exercise, i) => (
                <li key={exercise} className="flex gap-3 px-4 py-2.5">
                  <span className="w-4 shrink-0 text-right text-sm text-zinc-400 tabular-nums">{i + 1}</span>
                  <span className="text-zinc-950 dark:text-zinc-50">{exercise}</span>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <div className="sticky bottom-[calc(env(safe-area-inset-bottom)+4rem)] -mx-4 bg-zinc-50/95 px-4 pt-2 pb-2 dark:bg-black/95">
          <AddTemplateButton templateId={template.id} count={count} />
        </div>
      </div>
    </Screen>
  );
}
