import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccessRequestList } from "@/components/admin/access-request-list";
import { Screen } from "@/components/screen";
import { isAdmin, listRequests } from "@/lib/access";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Access Requests · Workout Tracker" };

export default async function AccessRequestsPage() {
  const user = await requireUser();
  if (!isAdmin(user.email)) notFound();

  return (
    <Screen title="Access Requests" back={{ href: "/settings", label: "Settings" }}>
      <AccessRequestList requests={await listRequests()} />
    </Screen>
  );
}
