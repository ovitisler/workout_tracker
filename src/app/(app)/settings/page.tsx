import type { Metadata } from "next";

import { signOut } from "@/app/sign-in/actions";
import { Screen } from "@/components/screen";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings · Workout Tracker" };

export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <Screen title="Settings">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-1">
          <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Account</h2>
          <div className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
            <p className="flex justify-between gap-3 px-4 py-3">
              <span className="text-zinc-950 dark:text-zinc-50">Email</span>
              <span className="truncate text-zinc-500">{user.email}</span>
            </p>
            <form action={signOut}>
              <button className="w-full px-4 py-3 text-left text-red-600 active:bg-zinc-100 dark:text-red-400 dark:active:bg-zinc-800">
                Sign out
              </button>
            </form>
          </div>
        </section>
      </div>
    </Screen>
  );
}
