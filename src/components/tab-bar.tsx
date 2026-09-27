"use client";

import { ChartLine, Dumbbell, ListChecks, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { tabForPath, TABS, type Tab } from "@/lib/tabs";

const ICONS: Record<Tab, typeof Dumbbell> = {
  routines: ListChecks,
  log: Dumbbell,
  stats: ChartLine,
  settings: Settings,
};

// Bottom tab bar. Like iOS, each tab remembers the screen you were on, and
// tapping the current tab again goes back to its first screen.
export function TabBar() {
  const pathname = usePathname();
  const current = tabForPath(pathname);

  const [lastPath, setLastPath] = useState<Partial<Record<Tab, string>>>({});
  if (current && lastPath[current] !== pathname) {
    setLastPath({ ...lastPath, [current]: pathname });
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-zinc-50/90 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-zinc-800 dark:bg-black/90">
      <ul className="mx-auto grid h-[3.25rem] max-w-lg grid-cols-4">
        {TABS.map(({ tab, label, path }) => {
          const Icon = ICONS[tab];
          const active = tab === current;
          return (
            <li key={tab}>
              <Link
                href={active ? path : (lastPath[tab] ?? path)}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                  active ? "text-blue-600 dark:text-blue-400" : "text-zinc-500"
                }`}
              >
                <Icon className="size-6" strokeWidth={active ? 2.25 : 1.75} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
