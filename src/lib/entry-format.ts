// Parsing and display helpers for entries. No server or database imports, so
// both the form (client) and the actions (server) can use them.

export type EntryValues = {
  date: string; // "YYYY-MM-DD"
  sets: number | null; // null = one set
  reps: number;
  weight: number; // lb
};

export type EntryInput = {
  date?: string | null;
  sets?: string | null;
  reps?: string | null;
  weight?: string | null;
};

export type ParseResult =
  | { ok: true; values: EntryValues }
  | { ok: false; error: string };

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function parseWholeNumber(value: string, max: number) {
  if (!/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return number >= 1 && number <= max ? number : undefined;
}

export function parseEntryInput(input: EntryInput): ParseResult {
  const date = (input.date ?? "").trim();
  const setsText = (input.sets ?? "").trim();
  const repsText = (input.reps ?? "").trim();
  const weightText = (input.weight ?? "").trim();

  if (!isValidDate(date)) return { ok: false, error: "Pick a date." };

  if (!/^\d+(\.\d+)?$/.test(weightText) && !/^\.\d+$/.test(weightText)) {
    return { ok: false, error: "Enter the weight in lb." };
  }
  const weight = Math.round(Number(weightText) * 100) / 100;
  if (weight > 9999.99) return { ok: false, error: "That weight is too heavy." };

  const reps = parseWholeNumber(repsText, 1000);
  if (reps === undefined) return { ok: false, error: "Reps must be a whole number of at least 1." };

  let sets: number | null = null;
  if (setsText) {
    const parsed = parseWholeNumber(setsText, 100);
    if (parsed === undefined) return { ok: false, error: "Sets must be a whole number of at least 1." };
    sets = parsed === 1 ? null : parsed;
  }

  return { ok: true, values: { date, sets, reps, weight } };
}

// 135 → "135", 137.5 → "137.5", 22.25 → "22.25"
export function formatWeight(weight: number) {
  return String(Math.round(weight * 100) / 100);
}

// "3 × 8", or "8 reps" for a single set.
export function formatSetsReps(entry: Pick<EntryValues, "sets" | "reps">) {
  if (entry.sets && entry.sets > 1) return `${entry.sets} × ${entry.reps}`;
  return `${entry.reps} rep${entry.reps === 1 ? "" : "s"}`;
}

// "135 lb · 3 × 8", or "225 lb · 8 reps" for a single set. Weight first: it's
// the number that changes week to week. Lists that can style the parts use
// <EntryText> instead.
export function formatEntry(entry: Pick<EntryValues, "sets" | "reps" | "weight">) {
  return `${formatWeight(entry.weight)} lb · ${formatSetsReps(entry)}`;
}

// "Sat, Sep 19", plus the year when it isn't the current one.
export function formatDay(date: string, today: string) {
  const sameYear = date.slice(0, 4) === today.slice(0, 4);
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

// How long ago a day was, for "when did I last do this": "Today",
// "Yesterday", "5 days ago", then the date once it's two weeks or more.
export function formatDaysAgo(date: string, today: string) {
  const days = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${date}T00:00:00Z`)) / 86_400_000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return formatDay(date, today);
}

// Today's date in the device's timezone, as "YYYY-MM-DD".
export function localToday(now = new Date()) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

// Groups entries (already sorted newest first) by date, keeping that order.
export function groupByDate<T extends { date: string }>(entries: T[]) {
  const groups: { date: string; entries: T[] }[] = [];
  for (const entry of entries) {
    const last = groups.at(-1);
    if (last?.date === entry.date) last.entries.push(entry);
    else groups.push({ date: entry.date, entries: [entry] });
  }
  return groups;
}
