import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { userSettings } from "@/db/schema";
import { resolveShowNotes } from "@/lib/show-notes";

// Never throws: see resolveShowNotes.
export function getShowNotes(userId: string) {
  return resolveShowNotes(async () => {
    const [row] = await getDb()
      .select({ showNotes: userSettings.showNotes })
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    return row?.showNotes;
  });
}
