"use client";

import { ChevronRight } from "lucide-react";
import { useFormStatus } from "react-dom";

import { ROUTINE_TEMPLATES } from "@/lib/routine-templates";

import { createRoutinesFromTemplate } from "./actions";

// One button per template; tapping one creates all its routines.
export function TemplatePicker() {
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white text-left dark:divide-zinc-800 dark:bg-zinc-900">
      {ROUTINE_TEMPLATES.map((template) => (
        <li key={template.id}>
          <form action={createRoutinesFromTemplate.bind(null, template.id)}>
            <TemplateButton
              name={template.name}
              description={template.description}
              routineNames={template.routines.map((r) => r.name)}
            />
          </form>
        </li>
      ))}
    </ul>
  );
}

function TemplateButton({
  name,
  description,
  routineNames,
}: {
  name: string;
  description: string;
  routineNames: string[];
}) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      aria-label={`Create ${routineNames.join(", ")} from the ${name} template`}
      className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-zinc-100 disabled:opacity-50 dark:active:bg-zinc-800"
    >
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-zinc-950 dark:text-zinc-50">
          {pending ? "Creating…" : name}
        </span>
        <span className="block text-sm text-zinc-500">{description}</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-zinc-400" aria-hidden />
    </button>
  );
}
