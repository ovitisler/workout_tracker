// "Today" on the Routines tab: everything logged on the device's date,
// whether or not it belongs to a routine. Pure, so it's tested; "today" is the
// device's date, passed in by the client component.

export type TodayEntry = {
  id: number;
  date: string; // "YYYY-MM-DD"
  exerciseId: number;
  name: string;
  sets: number | null; // null = one set
  reps: number;
  weight: number; // lb
};

export type TodayExercise = {
  exerciseId: number;
  name: string;
  // Sets across this exercise's entries today.
  sets: number;
  // In the order they were logged.
  entries: TodayEntry[];
};

// Today's entries grouped by exercise (in the order each was first logged),
// with the number of sets for each and in total. Entries from other days are
// ignored, so the server can send a few days' worth and let the device pick.
export function summarizeToday(entries: TodayEntry[], today: string) {
  const byExercise = new Map<number, TodayExercise>();
  for (const entry of [...entries].sort((a, b) => a.id - b.id)) {
    if (entry.date !== today) continue;
    const sets = entry.sets ?? 1;
    const group = byExercise.get(entry.exerciseId);
    if (group) {
      group.sets += sets;
      group.entries.push(entry);
    } else {
      byExercise.set(entry.exerciseId, {
        exerciseId: entry.exerciseId,
        name: entry.name,
        sets,
        entries: [entry],
      });
    }
  }
  const exercises = [...byExercise.values()];
  return { exercises, totalSets: exercises.reduce((sum, e) => sum + e.sets, 0) };
}
