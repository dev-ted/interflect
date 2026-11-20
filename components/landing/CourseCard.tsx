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
      className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300/90 hover:shadow-lg hover:shadow-indigo-950/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-indigo-500/60"
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnailUrl}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103 motion-reduce:transition-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/65 via-zinc-950/10 to-transparent" />

        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          {course.tier === "pro" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/95 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              <Crown className="h-3 w-3" aria-hidden="true" />
              Pro
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Free
            </span>
          )}

          {course.tier === "pro" && course.freePreviewCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-950/75 px-2.5 py-1 text-xs font-medium text-emerald-300 backdrop-blur-sm">
              <PlayCircle className="h-3 w-3" aria-hidden="true" />
              {course.freePreviewCount} free{" "}
              {course.freePreviewCount === 1 ? "preview" : "previews"}
            </span>
          )}
        </div>

        <div className="absolute right-3 bottom-3 left-3 flex items-center justify-between text-xs font-medium text-white/90">
          <span className="rounded-md bg-zinc-950/60 px-2 py-0.5 backdrop-blur-sm">
            {course.category}
          </span>
          <span className="rounded-md bg-zinc-950/60 px-2 py-0.5 backdrop-blur-sm">
            {LEVEL_LABEL[course.level]}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-950 transition-colors group-hover:text-indigo-600 dark:text-zinc-50 dark:group-hover:text-indigo-400">
          {course.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          {course.subtitle}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {course.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5">
          {course.isEnrolled && (
            <div className="mb-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Enrolled
                </span>
                <span className="font-mono text-zinc-500 dark:text-zinc-400">
                  {progressPct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-zinc-100 pt-3.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {course.moduleCount}{" "}
              {course.moduleCount === 1 ? "module" : "modules"} ·{" "}
              {course.lessonCount}{" "}
              {course.lessonCount === 1 ? "lesson" : "lessons"}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {course.estimatedHours}h
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
