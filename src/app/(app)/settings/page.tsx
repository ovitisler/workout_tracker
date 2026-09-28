import type { Metadata } from "next";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { signOut } from "@/app/sign-in/actions";
import { Screen } from "@/components/screen";
import { countPendingRequests, isAdmin } from "@/lib/access";
import { listCustomExercises } from "@/lib/exercises";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings · Workout Tracker" };

export default async function SettingsPage() {
  const user = await requireUser();
  const admin = isAdmin(user.email);
  const [pending, customExercises] = await Promise.all([
    admin ? countPendingRequests() : 0,
    listCustomExercises(user.id),
  ]);

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

        <section className="flex flex-col gap-1">
          <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Exercises</h2>
          <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900">
            <Link
              href="/settings/exercises"
              className="flex items-center justify-between gap-3 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
            >
              <span className="text-zinc-950 dark:text-zinc-50">Custom exercises</span>
              <span className="flex items-center gap-1 text-zinc-500">
                {customExercises.length}
                <ChevronRight className="size-5" aria-hidden />
              </span>
            </Link>
          </div>
        </section>

        {admin && (
          <section className="flex flex-col gap-1">
            <h2 className="px-1 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Admin</h2>
            <div className="overflow-hidden rounded-lg bg-white dark:bg-zinc-900">
              <Link
                href="/settings/access-requests"
                className="flex items-center justify-between gap-3 px-4 py-3 active:bg-zinc-100 dark:active:bg-zinc-800"
              >
                <span className="text-zinc-950 dark:text-zinc-50">Access requests</span>
                <span className="flex items-center gap-1 text-zinc-500">
                  {pending > 0 && (
                    <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-500">
                      {pending}
                    </span>
                  )}
                  <ChevronRight className="size-5" aria-hidden />
                </span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </Screen>
  );
}
