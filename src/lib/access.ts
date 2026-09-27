import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { accessRequests, user } from "@/db/schema";

import { parseEmailList } from "./email-list";

// Admins (ADMIN_EMAILS) review access requests in Settings.
export function isAdmin(email: string) {
  return parseEmailList(process.env.ADMIN_EMAILS).includes(email.toLowerCase());
}

// Sign-up is invite-only: an email can create an account if it's in
// ALLOWED_EMAILS or ADMIN_EMAILS, or an admin approved its access request.
export async function canSignUp(email: string) {
  const normalized = email.toLowerCase();
  if (parseEmailList(process.env.ALLOWED_EMAILS).includes(normalized) || isAdmin(normalized)) {
    return true;
  }
  const request = await findRequest(normalized);
  return request?.status === "approved";
}

export async function findRequest(email: string) {
  const [row] = await getDb()
    .select({ id: accessRequests.id, status: accessRequests.status })
    .from(accessRequests)
    .where(eq(sql`lower(${accessRequests.email})`, email.toLowerCase()));
  return row;
}

export async function hasAccount(email: string) {
  const [row] = await getDb()
    .select({ id: user.id })
    .from(user)
    .where(eq(sql`lower(${user.email})`, email.toLowerCase()));
  return row !== undefined;
}

export async function countPendingRequests() {
  const [row] = await getDb()
    .select({ n: count() })
    .from(accessRequests)
    .where(eq(accessRequests.status, "pending"));
  return row.n;
}

// Pending first (oldest first, so nobody waits forever), then reviewed ones,
// most recent first. `signedUp` is whether that email now has an account.
export function listRequests() {
  return getDb()
    .select({
      id: accessRequests.id,
      email: accessRequests.email,
      note: accessRequests.note,
      status: accessRequests.status,
      createdAt: accessRequests.createdAt,
      signedUp: sql<boolean>`${user.id} is not null`,
    })
    .from(accessRequests)
    .leftJoin(user, eq(sql`lower(${user.email})`, sql`lower(${accessRequests.email})`))
    .orderBy(
      sql`${accessRequests.status} <> 'pending'`,
      sql`case when ${accessRequests.status} = 'pending' then ${accessRequests.createdAt} end asc`,
      desc(accessRequests.reviewedAt),
    );
}

export type AccessRequest = Awaited<ReturnType<typeof listRequests>>[number];

export async function setRequestStatus(id: number, status: "approved" | "denied") {
  await getDb()
    .update(accessRequests)
    .set({ status, reviewedAt: new Date() })
    .where(eq(accessRequests.id, id));
}
