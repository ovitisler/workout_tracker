"use server";

import { refresh } from "next/cache";

import { isAdmin, setRequestStatus } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export async function reviewAccessRequest(id: number, status: "approved" | "denied") {
  const user = await requireUser();
  if (!isAdmin(user.email)) return;
  await setRequestStatus(id, status);
  refresh();
}
