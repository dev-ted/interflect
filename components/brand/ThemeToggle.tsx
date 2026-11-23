"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { usePreference } from "@ui-sdk/react/preferences";
import { colorScheme } from "@/lib/color-scheme";

const options = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle({
  className = "",
  vertical = false,
}: {
  className?: string;
  vertical?: boolean;
}) {
  const { value } = usePreference(colorScheme);

  return (
    <SegmentedControl
      aria-label="Color theme"
      value={value}
      onValueChange={(next) => colorScheme.set(next as typeof value)}
      orientation={vertical ? "vertical" : "horizontal"}
      className={`relative inline-flex items-center rounded-full border border-line bg-subtle p-0.5 ${vertical ? "w-8 flex-col" : "h-8"} ${className}`}
    >
      <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-full bg-surface shadow-card transition-[left,top,width,height] duration-200 ease-out data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
      {options.map(({ value: v, label, Icon }) => (
        <SegmentedControlItem
          key={v}
          value={v}
          aria-label={label}
          title={label}
          className="relative z-10 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-mist transition-colors duration-150 data-checked:text-ink"
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  );
}
