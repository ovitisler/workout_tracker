export type Tab = "routines" | "log" | "stats";

export const TABS: { tab: Tab; label: string; path: string }[] = [
  { tab: "routines", label: "Routines", path: "/routines" },
  { tab: "log", label: "Log", path: "/" },
  { tab: "stats", label: "Stats", path: "/stats" },
];

export function tabPath(tab: Tab) {
  return TABS.find((t) => t.tab === tab)!.path;
}
