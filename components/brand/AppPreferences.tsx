"use client";

import type { ReactNode } from "react";
import { Preferences } from "@ui-sdk/react/preferences";
import { colorScheme } from "@/lib/color-scheme";

// Applies the saved color scheme to <html> before first paint (no flash).
export function AppPreferences({ children }: { children: ReactNode }) {
  return <Preferences preferences={[colorScheme]}>{children}</Preferences>;
}
