"use server";

import { refresh } from "next/cache";

import { getDb } from "@/db";
import { userSettings } from "@/db/schema";
import { requireUser } from "@/lib/auth";

export async function setShowNotes(showNotes: boolean) {
  const user = await requireUser();
  const values = { showNotes: showNotes === true };
  await getDb()
    .insert(userSettings)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: userSettings.userId, set: values });
  refresh();
}
