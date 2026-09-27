import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { ROUTINE_TEMPLATES } from "@/lib/routine-templates";

// One row per template; tapping one opens a preview of what it would add.
export function TemplatePicker() {
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white text-left dark:divide-zinc-800 dark:bg-zinc-900">
      {ROUTINE_TEMPLATES.map((template) => (
        <li key={template.id}>
          <Link
            href={`/routines/templates/${template.id}`}
            className="flex w-full items-center gap-3 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
          >
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-zinc-950 dark:text-zinc-50">{template.name}</span>
              <span className="block text-sm text-zinc-500">{template.description}</span>
            </span>
            <ChevronRight className="size-5 shrink-0 text-zinc-400" aria-hidden />
          </Link>
        </li>
      ))}
    </ul>
  );
}
