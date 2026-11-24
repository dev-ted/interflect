"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useQuery } from "convex/react";
import { Check, ChevronDown, Search } from "lucide-react";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { api } from "@/convex/_generated/api";
import { CourseCard, type CourseCardItem } from "./CourseCard";
import { PRO_ENABLED } from "@/convex/lib/features";

type TierFilter = "all" | "free" | "pro";

const TIERS: { value: TierFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

const LEVELS = [
  { value: "all", label: "Any level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

function FilterSelect({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Select items={items} value={value} onValueChange={(v) => v && onChange(v)}>
      <SelectTrigger
        aria-label={label}
        className="field flex w-full cursor-pointer items-center justify-between gap-2 sm:w-44"
      >
        <SelectValue className="truncate" />
        <ChevronDown className="h-4 w-4 shrink-0 text-mist" aria-hidden="true" />
      </SelectTrigger>
      <SelectContent className="card z-50 min-w-(--anchor-width) origin-(--transform-origin) p-1 transition-[opacity,transform] duration-150 ease-(--ease-out) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100">
        {items.map((item) => (
          <SelectItem
            key={item.value}
            value={item.value}
            className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 py-2 text-sm outline-none data-highlighted:bg-subtle"
          >
            {item.label}
            <SelectItemIndicator>
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function CourseCatalogClient() {
  const courses = useQuery(api.courses.listPublished, {});
  const [tier, setTier] = useState<TierFilter>("all");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => [
      { value: "all", label: "All topics" },
      ...Array.from(new Set(courses?.map((c) => c.category) ?? [])).map((c) => ({
        value: c,
        label: c,
      })),
    ],
    [courses],
  );

  const filtered = useMemo(() => {
    if (!courses) return [];
    const q = search.trim().toLowerCase();
    return courses.filter((course) => {
      if (tier !== "all" && course.tier !== tier) return false;
      if (level !== "all" && course.level !== level) return false;
      if (category !== "all" && course.category !== category) return false;
      if (q) {
        const hay = `${course.title} ${course.subtitle} ${course.category} ${course.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [courses, tier, level, category, search]);

  return (
    <>
      <h1 className="text-3xl font-extrabold sm:text-4xl">Courses</h1>
      <p className="mt-2 max-w-2xl text-mist">
        {PRO_ENABLED
          ? "Pro courses open with free preview lessons, so you can try them before you upgrade."
          : "Every course is free while Interflect is new. Pick one and start."}
      </p>

      <div className="mt-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses or topics"
            aria-label="Search courses"
            className="field pl-9"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {PRO_ENABLED && (
          <SegmentedControl
            aria-label="Plan"
            value={tier}
            onValueChange={(val) => {
              if (val === "all" || val === "free" || val === "pro") setTier(val);
            }}
            className="relative isolate inline-flex h-10 w-full rounded-md border border-line bg-subtle p-0.5 sm:w-auto"
          >
            <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-[5px] bg-surface shadow-card transition-[top,left,width,height] duration-200 ease-(--ease-out) data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
            {TIERS.map((t) => (
              <SegmentedControlItem
                key={t.value}
                value={t.value}
                className="flex-1 cursor-pointer rounded-[5px] px-4 text-sm font-medium text-mist transition-colors duration-150 data-checked:text-ink sm:flex-none"
              >
                {t.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>
          )}

          <div className="grid grid-cols-2 gap-3 sm:flex">
            <FilterSelect label="Level" items={LEVELS} value={level} onChange={setLevel} />
            {categories.length > 2 && (
              <FilterSelect
                label="Topic"
                items={categories}
                value={category}
                onChange={setCategory}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {courses === undefined ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={`catalog-skeleton-${i}`}
              className="h-96 animate-pulse rounded-xl bg-subtle motion-reduce:animate-none"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-xl border border-dashed border-line p-10 text-center">
            <p className="font-semibold">No courses match these filters</p>
            <p className="mt-1 text-sm text-mist">
              Clear the search or pick another plan or level.
            </p>
          </div>
        ) : (
          filtered.map((course, i) => (
            <div key={course._id} className="enter" style={{ "--enter-i": i } as CSSProperties}>
              <CourseCard course={course as CourseCardItem} />
            </div>
          ))
        )}
      </div>
    </>
  );
}
