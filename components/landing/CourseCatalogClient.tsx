"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Search } from "lucide-react";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { api } from "@/convex/_generated/api";
import { CourseCard, type CourseCardItem } from "./CourseCard";

type TierFilter = "all" | "free" | "pro";

export function CourseCatalogClient() {
  const courses = useQuery(api.courses.listPublished, {});
  const [tier, setTier] = useState<TierFilter>("all");
  const [category, setCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    if (!courses) return [];
    return Array.from(new Set(courses.map((c) => c.category)));
  }, [courses]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    const q = search.trim().toLowerCase();
    return courses.filter((course) => {
      if (tier !== "all" && course.tier !== tier) return false;
      if (category !== "all" && course.category !== category) return false;
      if (q) {
        const hay = `${course.title} ${course.subtitle} ${course.category} ${course.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [courses, tier, category, search]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
          All Courses
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
          Explore the curriculum
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Every Pro course includes free preview lessons so you can experience
          the teaching style and code depth before upgrading.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, topics, or tags..."
            aria-label="Search courses"
            className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pr-4 pl-10 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <SegmentedControl
          aria-label="Filter by plan tier"
          value={tier}
          onValueChange={(val) => {
            if (val === "all" || val === "free" || val === "pro") {
              setTier(val);
            }
          }}
          className="relative isolate inline-flex rounded-xl border border-zinc-200 bg-zinc-100/90 p-1 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-lg bg-white shadow-xs transition-[top,left,width,height] duration-200 data-[activation-direction=none]:transition-none dark:bg-zinc-800" />
          <SegmentedControlItem
            value="all"
            className="cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-600 data-checked:text-zinc-950 dark:text-zinc-400 dark:data-checked:text-white"
          >
            All
          </SegmentedControlItem>
          <SegmentedControlItem
            value="free"
            className="cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-600 data-checked:text-zinc-950 dark:text-zinc-400 dark:data-checked:text-white"
          >
            Free
          </SegmentedControlItem>
          <SegmentedControlItem
            value="pro"
            className="cursor-pointer rounded-lg px-3.5 py-1.5 text-sm font-medium text-zinc-600 data-checked:text-zinc-950 dark:text-zinc-400 dark:data-checked:text-white"
          >
            Pro
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      {categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              category === "all"
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                category === cat
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses === undefined ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`catalog-skeleton-${i}`}
              className="h-[400px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-base font-semibold text-zinc-950 dark:text-white">
              No courses match your filters
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try clearing your search or switching back to All tiers.
            </p>
          </div>
        ) : (
          filtered.map((course) => (
            <CourseCard key={course._id} course={course as CourseCardItem} />
          ))
        )}
      </div>
    </div>
  );
}
