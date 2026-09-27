// Ready-made sets of routines a new user can start from, using built-in
// exercises (names must match drizzle/0003_seed_exercises.sql; a test checks).

export type RoutineTemplate = {
  id: string;
  name: string;
  description: string;
  routines: { name: string; exercises: string[] }[];
};

export const ROUTINE_TEMPLATES: RoutineTemplate[] = [
  {
    id: "push-pull-legs",
    name: "Push / Pull / Legs",
    description: "3 routines: chest, shoulders & triceps · back & biceps · legs",
    routines: [
      {
        name: "Push",
        exercises: [
          "Bench Press",
          "Incline Dumbbell Press",
          "Overhead Press",
          "Lateral Raise",
          "Triceps Pushdown",
        ],
      },
      {
        name: "Pull",
        exercises: ["Deadlift", "Barbell Row", "Lat Pulldown", "Face Pull", "Barbell Curl"],
      },
      {
        name: "Legs",
        exercises: [
          "Squat",
          "Romanian Deadlift",
          "Leg Press",
          "Lying Leg Curl",
          "Standing Calf Raise",
        ],
      },
    ],
  },
  {
    id: "upper-lower",
    name: "Upper / Lower",
    description: "4 routines: two upper-body days and two lower-body days",
    routines: [
      {
        name: "Upper 1",
        exercises: [
          "Bench Press",
          "Barbell Row",
          "Overhead Press",
          "Lat Pulldown",
          "Barbell Curl",
          "Triceps Pushdown",
        ],
      },
      {
        name: "Lower 1",
        exercises: [
          "Squat",
          "Romanian Deadlift",
          "Leg Press",
          "Standing Calf Raise",
          "Hanging Leg Raise",
        ],
      },
      {
        name: "Upper 2",
        exercises: [
          "Incline Dumbbell Press",
          "Pull-Up",
          "Seated Dumbbell Shoulder Press",
          "Seated Cable Row",
          "Hammer Curl",
          "Skull Crusher",
        ],
      },
      {
        name: "Lower 2",
        exercises: [
          "Deadlift",
          "Front Squat",
          "Bulgarian Split Squat",
          "Seated Leg Curl",
          "Seated Calf Raise",
        ],
      },
    ],
  },
];

export function findTemplate(id: string) {
  return ROUTINE_TEMPLATES.find((t) => t.id === id);
}

// A routine name that doesn't clash with the user's existing ones (ignoring
// case): "Push", then "Push (2)", "Push (3)"…
export function uniqueName(name: string, taken: string[]) {
  const lower = new Set(taken.map((t) => t.toLowerCase()));
  if (!lower.has(name.toLowerCase())) return name;
  for (let n = 2; ; n++) {
    const candidate = `${name} (${n})`;
    if (!lower.has(candidate.toLowerCase())) return candidate;
  }
}
