"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "courses", label: "Courses" },
] as const;

/** Overview / Courses tabs, kept in the URL (?tab=courses) so a refresh or shared link opens the same tab. */
export function AdminTabs({ overview, courses }: { overview: ReactNode; courses: ReactNode }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = params.get("tab") === "courses" ? "courses" : "overview";

  return (
    <Tabs
      value={tab}
      onValueChange={(next) => {
        const q = new URLSearchParams(params);
        if (next === "overview") q.delete("tab");
        else q.set("tab", String(next));
        router.replace(`${pathname}${q.size ? `?${q}` : ""}`, { scroll: false });
      }}
    >
      <TabsList aria-label="Admin studio sections" className="relative mb-8 flex gap-6 border-b border-line">
        {TABS.map((t) => (
          <TabsTab
            key={t.value}
            value={t.value}
            className="relative cursor-pointer pb-3 text-sm font-medium text-mist transition-colors duration-150 hover:text-ink data-selected:text-ink"
          >
            {t.label}
          </TabsTab>
        ))}
        <TabsIndicator className="absolute bottom-[-1px] left-(--active-tab-left) h-0.5 w-(--active-tab-width) rounded-full bg-ink transition-[left,width] duration-200 ease-(--ease-out) data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
      </TabsList>
      <TabsPanel value="overview">{overview}</TabsPanel>
      <TabsPanel value="courses">{courses}</TabsPanel>
    </Tabs>
  );
}
