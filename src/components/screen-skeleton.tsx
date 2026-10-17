"use client";

import { usePathname } from "next/navigation";

import { TABS } from "@/lib/tabs";

const block = "rounded bg-zinc-200 motion-safe:animate-pulse dark:bg-zinc-800";

// What a screen looks like while its data loads: the same top bar as
// <Screen>, then grey placeholders shaped like a list. Unused for now: the
// loading.tsx files that render it are switched off (see CLAUDE.md).
// A tab's first screen shows its real title, since we know it; deeper screens
// show a placeholder.
export function ScreenSkeleton() {
  const pathname = usePathname();
  const title = TABS.find((t) => t.path === pathname)?.label;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-zinc-50/90 pt-[env(safe-area-inset-top)] backdrop-blur dark:border-zinc-800 dark:bg-black/90">
        <div className="mx-auto flex h-11 max-w-lg items-center justify-center px-2">
          {title ? (
            <h1 className="text-[17px] font-semibold text-zinc-950 dark:text-zinc-50">{title}</h1>
          ) : (
            <div className={`h-4 w-32 ${block}`} />
          )}
        </div>
      </header>
      <main
        role="status"
        className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-4 px-4 pt-4 pb-[calc(env(safe-area-inset-bottom)+5.5rem)]"
      >
        <span className="sr-only">Loading…</span>
        <div className={`h-3 w-40 ${block}`} />
        <div className="divide-y divide-zinc-200 overflow-hidden rounded-lg bg-white dark:divide-zinc-800 dark:bg-zinc-900">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 px-4 py-4">
              <div className={`h-4 w-1/3 ${block}`} />
              <div className={`h-3 w-2/3 ${block}`} />
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
