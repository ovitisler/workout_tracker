"use client";

import { useState } from "react";

import { MUSCLE_GROUP_LABELS, MUSCLE_GROUPS, type MuscleGroup } from "@/lib/muscle-groups";

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-base text-zinc-950 outline-none focus:border-zinc-950 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";

// Name + muscle group, for creating or editing a custom exercise. Choosing a
// muscle group only selects it; the form's own button submits.
export function ExerciseFormFields({
  defaultName,
  defaultGroup,
  onGroupChange,
}: {
  defaultName: string;
  defaultGroup?: MuscleGroup;
  onGroupChange?: (group: MuscleGroup) => void;
}) {
  const [group, setGroup] = useState<MuscleGroup | undefined>(defaultGroup);

  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-zinc-500">Name</span>
        <input
          name="name"
          defaultValue={defaultName}
          required
          maxLength={60}
          autoComplete="off"
          className={inputClass}
        />
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend className="mb-1 text-xs font-medium text-zinc-500">Muscle group</legend>
        <div className="grid grid-cols-2 gap-2">
          {MUSCLE_GROUPS.map((g) => (
            <label
              key={g}
              className="flex cursor-pointer items-center justify-center rounded-lg border border-zinc-300 px-3 py-2 text-zinc-950 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-600 has-[:checked]:text-white has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-400 dark:border-zinc-700 dark:text-zinc-50 dark:has-[:checked]:border-blue-500 dark:has-[:checked]:bg-blue-500"
            >
              <input
                type="radio"
                name="muscleGroup"
                value={g}
                checked={group === g}
                onChange={() => {
                  setGroup(g);
                  onGroupChange?.(g);
                }}
                required
                className="sr-only"
              />
              {MUSCLE_GROUP_LABELS[g]}
            </label>
          ))}
        </div>
      </fieldset>
    </>
  );
}
