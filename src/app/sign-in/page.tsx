import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in · Workout Tracker" };

export default async function SignInPage() {
  if (await getSession()) redirect("/");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Workout Tracker
        </h1>
        <SignInForm />
      </div>
    </main>
  );
}
