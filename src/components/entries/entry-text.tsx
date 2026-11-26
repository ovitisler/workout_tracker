import { formatSetsReps, formatWeight, type EntryValues } from "@/lib/entry-format";

// An entry with the weight in bold and sets × reps beside it in grey, so a
// list of them reads as a column of weights. The plain-text version is
// formatEntry().
export function EntryText({ entry }: { entry: Pick<EntryValues, "sets" | "reps" | "weight"> }) {
  return (
    <span className="inline-flex items-baseline gap-2">
      <span className="font-semibold text-zinc-950 tabular-nums dark:text-zinc-50">
        {formatWeight(entry.weight)} lb
      </span>
      <span className="text-zinc-500 tabular-nums">{formatSetsReps(entry)}</span>
    </span>
  );
}

// An entry's note, under its numbers. Keeps the user's line breaks.
export function EntryNote({ note }: { note: string }) {
  return (
    <span className="block text-sm break-words whitespace-pre-wrap text-zinc-600 dark:text-zinc-400">
      {note}
    </span>
  );
}
