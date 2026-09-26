// Tidies a typed exercise name: trims, collapses spaces, and capitalizes the
// first letter of each word ("one arm  pullover" → "One Arm Pullover").
// Other letters are left alone so things like "EZ-Bar" survive.
export function normalizeExerciseName(name: string) {
  return name
    .trim()
    .replace(/\s+/g, " ")
    .replace(/(^|\s)(\p{Ll})/gu, (_, space, letter) => space + letter.toUpperCase());
}
