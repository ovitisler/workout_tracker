// The "Notes box" setting, apart from the database so it can be unit tested.

// `read` resolves to the saved value, or undefined if the user has none. The
// box shows by default, including when the setting can't be read: a settings
// problem shouldn't stop anyone logging.
export async function resolveShowNotes(read: () => Promise<boolean | undefined>) {
  try {
    return (await read()) ?? true;
  } catch (error) {
    console.error("Couldn't read the notes setting; showing the notes box.", error);
    return true;
  }
}
