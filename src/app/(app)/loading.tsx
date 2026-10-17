import { ScreenSkeleton } from "@/components/screen-skeleton";

// Shown instantly while a signed-in screen loads its data; the tab bar (in the
// layout) stays put.
export default function Loading() {
  return <ScreenSkeleton />;
}
