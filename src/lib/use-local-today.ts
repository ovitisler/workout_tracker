"use client";

import { useSyncExternalStore } from "react";

import { localToday } from "./entry-format";

// Today's date ("YYYY-MM-DD") in the device's timezone. It's only known in the
// browser, so this is "" during server rendering and fills in on hydration.
export function useLocalToday() {
  return useSyncExternalStore(
    () => () => {},
    localToday,
    () => "",
  );
}
