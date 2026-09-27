"use client";

import { useFormStatus } from "react-dom";

import { createRoutinesFromTemplate } from "./actions";

export function AddTemplateButton({ templateId, count }: { templateId: string; count: number }) {
  return (
    <form action={createRoutinesFromTemplate.bind(null, templateId)}>
      <SubmitButton label={`Add these ${count} routines`} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white disabled:opacity-50 dark:bg-blue-500"
    >
      {pending ? "Adding…" : label}
    </button>
  );
}
