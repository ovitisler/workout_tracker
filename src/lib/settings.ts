import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { userSettings } from "@/db/schema";

export async function getShowNotes(userId: string) {
  const [row] = await getDb()
    .select({ showNotes: userSettings.showNotes })
    .from(userSettings)
    .where(eq(userSettings.userId, userId));
  return row?.showNotes ?? true;
}
