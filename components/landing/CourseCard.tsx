"use client";

import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  PlayCircle,
  Sparkles,
} from "lucide-react";

export interface CourseCardItem {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  tier: "free" | "pro";
  estimatedHours: number;
  tags: string[];
  tutorName: string;
  moduleCount: number;
  lessonCount: number;
  freePreviewCount: number;
  totalDurationSeconds: number;
  isEnrolled: boolean;
  completedLessons: number;
  firstLessonSlug: string | null;
}

const LEVEL_LABEL: Record<CourseCardItem["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function CourseCard({ course }: { course: CourseCardItem }) {
  const progressPct =
    course.lessonCount > 0
      ? Math.round((course.completedLessons / course.lessonCount) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="tactile-card tactile-card-interactive group flex flex-col overflow-hidden rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b-2 border-[#18181B] bg-[#F6EFE0] dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-104 motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111116]/75 via-[#111116]/15 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          {course.tier === "pro" ? (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#2563EB] px-2.5 py-0.5 text-xs font-extrabold text-white shadow-[2px_2px_0_0_#111116]">
              <Crown className="h-3 w-3 text-[#FFB800]" aria-hidden="true" />
              PRO
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#00B87C] px-2.5 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              FREE
            </span>
          )}

          {course.tier === "pro" && course.freePreviewCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-2.5 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
              <PlayCircle className="h-3 w-3" aria-hidden="true" />
              {course.freePreviewCount} free{" "}
              {course.freePreviewCount === 1 ? "preview" : "previews"}
            </span>
          )}
        </div>

        <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-xs font-bold text-[#FAFAF5]">
          <span className="rounded-lg border border-white/25 bg-[#111116]/80 px-2.5 py-0.5 backdrop-blur-xs">
            {course.category}
          </span>
          <span className="rounded-lg border border-white/25 bg-[#111116]/80 px-2.5 py-0.5 backdrop-blur-xs">
            {LEVEL_LABEL[course.level]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-extrabold tracking-tight text-[#111116] transition-colors group-hover:text-[#D93817] dark:text-[#FAFAF5] dark:group-hover:text-[#FF6B4A]">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
          {course.subtitle}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-lg border border-[#18181B]/20 bg-[#F6EFE0] px-2.5 py-0.5 text-xs font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#E4E4EE]"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          {course.isEnrolled && (
            <div className="mb-3.5">
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-bold text-[#047857] dark:text-[#34D399]">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Enrolled
                </span>
                <span className="font-mono font-bold text-[#111116] dark:text-[#FAFAF5]">
                  {progressPct}%
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#18181B] bg-[#F6EFE0] dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
                <div
                  className="h-full rounded-full bg-[#00B87C] transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t-2 border-dashed border-[#E6DCC6] pt-3.5 text-xs font-semibold text-[#52525B] dark:border-[#2A2A3B] dark:text-[#B4B4C6]">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-[#D93817] dark:text-[#FF6B4A]" aria-hidden="true" />
              {course.moduleCount}{" "}
              {course.moduleCount === 1 ? "module" : "modules"} ·{" "}
              {course.lessonCount}{" "}
              {course.lessonCount === 1 ? "lesson" : "lessons"}
            </span>
            <span className="inline-flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-[#60A5FA]" aria-hidden="true" />
              {course.estimatedHours}h
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
