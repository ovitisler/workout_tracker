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

// "3 × 8 @ 135 lb", or "8 @ 135 lb" for a single set.
export function formatEntry(entry: Pick<EntryValues, "sets" | "reps" | "weight">) {
  const reps = entry.sets && entry.sets > 1 ? `${entry.sets} × ${entry.reps}` : `${entry.reps}`;
  return `${reps} @ ${formatWeight(entry.weight)} lb`;
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
