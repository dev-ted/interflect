"use client";

import type { ReactNode } from "react";
import { Preferences } from "@ui-sdk/react/preferences";
import { colorScheme, sidebarState } from "@/lib/color-scheme";

// Applies the saved color scheme and sidebar state to <html> before first paint (no flash).
export function AppPreferences({ children }: { children: ReactNode }) {
  return <Preferences preferences={[colorScheme, sidebarState]}>{children}</Preferences>;
}
