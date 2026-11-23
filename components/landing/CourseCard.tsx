"use client";

import Link from "next/link";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import { BookOpen, CheckCircle2, Clock, Crown } from "lucide-react";

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

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function CourseCard({ course, wide = false }: { course: CourseCardItem; wide?: boolean }) {
  const progressPct =
    course.lessonCount > 0
      ? Math.round((course.completedLessons / course.lessonCount) * 100)
      : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className={`card group flex h-full flex-col overflow-hidden transition-colors duration-150 hover:border-mist ${wide ? "md:flex-row" : ""}`}
    >
      <div
        className={`aspect-video w-full shrink-0 overflow-hidden border-b border-line bg-subtle ${
          wide ? "md:w-[58%] md:border-r md:border-b-0" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnailUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-300 ease-(--ease-out) motion-reduce:transition-none [@media(hover:hover)_and_(pointer:fine)]:group-hover:scale-[1.03]"
        />
      </div>

      <div className={`flex flex-1 flex-col gap-3 p-5 ${wide ? "md:justify-center md:p-8" : ""}`}>
        <div className="flex flex-wrap items-center gap-2">
          {course.tier === "pro" ? (
            <span className="chip">
              <Crown className="h-3 w-3 text-sun" aria-hidden="true" />
              Pro
            </span>
          ) : (
            <span className="chip text-sage">Free</span>
          )}
          {course.tier === "pro" && course.freePreviewCount > 0 && (
            <span className="chip">
              {plural(course.freePreviewCount, "free preview")}
            </span>
          )}
        </div>
        <p className="-mt-1 text-xs text-mist">
          {course.category}, {LEVEL_LABEL[course.level].toLowerCase()}
        </p>

        <h3
          className={`leading-snug font-semibold tracking-[-0.02em] text-ink ${wide ? "text-lg md:text-2xl" : "text-lg"}`}
        >
          {course.title}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-mist">
          {course.subtitle}
        </p>

        <div className={`space-y-3 pt-2 ${wide ? "md:mt-4" : "mt-auto"}`}>
          {course.isEnrolled && (
            <Progress value={progressPct} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <ProgressLabel className="inline-flex items-center gap-1 font-semibold text-sage">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Enrolled
                </ProgressLabel>
                <ProgressValue className="font-semibold text-ink tabular-nums" />
              </div>
              <ProgressTrack className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                <ProgressIndicator className="h-full rounded-full bg-sun" />
              </ProgressTrack>
            </Progress>
          )}

          <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-mist">
            <span className="inline-flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {plural(course.lessonCount, "lesson")} in{" "}
              {plural(course.moduleCount, "module")}
            </span>
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {course.estimatedHours}h
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
