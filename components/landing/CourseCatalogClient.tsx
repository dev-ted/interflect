"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Search, Sparkles } from "lucide-react";
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
        <span className="inline-flex -rotate-1 items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#111116] uppercase shadow-[2px_2px_0_0_#111116]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          All Courses
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111116] sm:text-5xl dark:text-[#FAFAF5]">
          Explore the curriculum
        </h1>
        <p className="mt-2.5 text-base text-[#52525B] dark:text-[#B4B4C6]">
          Every Pro course includes free preview lessons so you can experience
          the teaching style and code depth before upgrading.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#52525B] dark:text-[#B4B4C6]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses, topics, or tags..."
            aria-label="Search courses"
            className="min-h-11 w-full rounded-xl border-2 border-[#18181B] bg-white py-2.5 pr-4 pl-10 text-sm font-medium text-[#111116] shadow-[3px_3px_0_0_#111116] placeholder:text-[#71717A] focus:border-[#2563EB] focus:outline-none dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#FAFAF5] dark:shadow-[3px_3px_0_0_#000000] dark:placeholder:text-[#8C8CA1]"
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
          className="relative isolate inline-flex rounded-xl border-2 border-[#18181B] bg-[#F6EFE0] p-1 shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[3px_3px_0_0_#000000]"
        >
          <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-lg border-2 border-[#18181B] bg-[#FFB800] transition-[top,left,width,height] duration-200 data-[activation-direction=none]:transition-none dark:border-[#18181B]" />
          <SegmentedControlItem
            value="all"
            className="min-h-10 cursor-pointer rounded-lg px-4 py-1.5 text-sm font-bold text-[#52525B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-checked:text-[#111116] sm:min-h-9 dark:text-[#B4B4C6] dark:data-checked:text-[#111116]"
          >
            All
          </SegmentedControlItem>
          <SegmentedControlItem
            value="free"
            className="min-h-10 cursor-pointer rounded-lg px-4 py-1.5 text-sm font-bold text-[#52525B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-checked:text-[#111116] sm:min-h-9 dark:text-[#B4B4C6] dark:data-checked:text-[#111116]"
          >
            Free
          </SegmentedControlItem>
          <SegmentedControlItem
            value="pro"
            className="min-h-10 cursor-pointer rounded-lg px-4 py-1.5 text-sm font-bold text-[#52525B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-checked:text-[#111116] sm:min-h-9 dark:text-[#B4B4C6] dark:data-checked:text-[#111116]"
          >
            Pro
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      {categories.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={category === "all"}
            onClick={() => setCategory("all")}
            className={`min-h-11 cursor-pointer rounded-full border-2 px-3.5 py-1 text-xs font-extrabold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:min-h-9 ${
              category === "all"
                ? "border-[#18181B] bg-[#111116] text-[#FFFBF2] shadow-[2px_2px_0_0_#FF5A36] dark:border-[#FAFAF5] dark:bg-[#FAFAF5] dark:text-[#111116]"
                : "border-[#18181B]/30 bg-white text-[#52525B] hover:border-[#18181B] hover:bg-[#F6EFE0] hover:text-[#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6] dark:hover:text-[#FAFAF5]"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => setCategory(cat)}
              className={`min-h-11 cursor-pointer rounded-full border-2 px-3.5 py-1 text-xs font-extrabold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:min-h-9 ${
                category === cat
                  ? "border-[#18181B] bg-[#111116] text-[#FFFBF2] shadow-[2px_2px_0_0_#FF5A36] dark:border-[#FAFAF5] dark:bg-[#FAFAF5] dark:text-[#111116]"
                  : "border-[#18181B]/30 bg-white text-[#52525B] hover:border-[#18181B] hover:bg-[#F6EFE0] hover:text-[#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6] dark:hover:text-[#FAFAF5]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
        {courses === undefined ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`catalog-skeleton-${i}`}
              className="h-[410px] animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]"
            />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full rounded-3xl border-2 border-dashed border-[#18181B]/40 bg-white p-12 text-center dark:border-[#3A3A52] dark:bg-[#16161F]">
            <p className="font-display text-lg font-extrabold text-[#111116] dark:text-[#FAFAF5]">
              No courses match your filters
            </p>
            <p className="mt-1 text-sm text-[#52525B] dark:text-[#B4B4C6]">
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
