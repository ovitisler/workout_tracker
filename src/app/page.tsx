import { requireUser } from "@/lib/auth";

import { signOut } from "./sign-in/actions";

export default async function Home() {
  const user = await requireUser();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-zinc-50 px-4 text-center dark:bg-black">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Workout Tracker
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as {user.email}. Workouts coming soon.
      </p>
      <form action={signOut}>
        <button className="text-sm text-zinc-600 underline dark:text-zinc-400">
          Sign out
        </button>
      </form>
    </main>
  );
}
