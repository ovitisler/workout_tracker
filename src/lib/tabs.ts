export type Tab = "routines" | "log" | "stats" | "settings";

export const TABS: { tab: Tab; label: string; path: string }[] = [
  { tab: "routines", label: "Routines", path: "/routines" },
  { tab: "log", label: "Log", path: "/log" },
  { tab: "stats", label: "Stats", path: "/stats" },
  { tab: "settings", label: "Settings", path: "/settings" },
];

export function tabPath(tab: Tab) {
  return TABS.find((t) => t.tab === tab)!.path;
}

// Which tab a URL path belongs to.
export function tabForPath(pathname: string): Tab | undefined {
  return TABS.find((t) => pathname === t.path || pathname.startsWith(`${t.path}/`))?.tab;
}
