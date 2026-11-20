"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { ArrowLeft, CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

export function LessonLayoutShell({
  courseSlug,
  children,
}: {
  courseSlug: string;
  children: ReactNode;
}) {
  const params = useParams<{ lessonSlug?: string }>();
  const activeLessonSlug =
    typeof params.lessonSlug === "string" ? params.lessonSlug : null;

  // Subscribes ONLY to `courseSlug`, so switching between lessons inside the
  // same course keeps this layout, its Convex subscription, and the sidebar
  // scroll position mounted without re-fetching or flashing skeletons.
  const course = useQuery(api.courses.getCourseBySlug, { slug: courseSlug });
  const { has } = useAuth();
  const { user } = useUser();

  const isAdmin = isAdminRole(user?.publicMetadata);
  const clientHasPro = Boolean(
    has?.({ plan: PRO_PLAN_SLUG }) ||
      has?.({ feature: "pro_courses" }) ||
      isAdmin,
  );

  const hasProAccess = Boolean(
    course?.hasProAccess || clientHasPro || course?.isAdmin,
  );

  const activeModule = course?.modules.find((mod) =>
    mod.lessons.some((l) => l.slug === activeLessonSlug),
  );
  const activeLesson = activeModule?.lessons.find(
    (l) => l.slug === activeLessonSlug,
  );

  const totalLessons = course?.totalLessons ?? 0;
  const completedCount = course?.completedLessons ?? 0;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Persistent Breadcrumb & Progress Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex shrink-0 items-center gap-1.5 font-medium text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {course ? course.title : "Back to Course"}
            </Link>
            {activeModule && (
              <>
                <span aria-hidden="true">/</span>
                <span className="truncate">{activeModule.title}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {course?.tier === "pro" && activeLesson?.isFreePreview && (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                Free Preview
              </span>
            )}
            {course && (
              <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                {completedCount}/{totalLessons} completed ({progressPct}%)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Dynamic Lesson Content Slot (only this swaps on navigation) */}
          <div className="lg:col-span-8">{children}</div>

          {/* Persistent Course Outline Sidebar */}
          <aside className="sticky top-22 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white lg:col-span-4 dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
                Course Outline
              </h2>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {course === undefined ? (
              <div className="space-y-3 p-4">
                <div className="h-10 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-10 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                <div className="h-10 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ) : course === null ? (
              <div className="p-5 text-sm text-zinc-500 dark:text-zinc-400">
                Course curriculum unavailable.
              </div>
            ) : (
              <nav
                aria-label="Course lessons"
                className="max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800"
              >
                {course.modules.map((mod) => (
                  <div key={mod._id} className="p-4">
                    <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                      {mod.title}
                    </p>
                    <ul className="mt-2 space-y-1">
                      {mod.lessons.map((item) => {
                        const isActive = item.slug === activeLessonSlug;
                        const isLocked =
                          course.tier === "pro" &&
                          !item.isFreePreview &&
                          !hasProAccess;
                        return (
                          <li key={item._id}>
                            <Link
                              href={`/courses/${course.slug}/lessons/${item.slug}`}
                              scroll={false}
                              aria-current={isActive ? "page" : undefined}
                              className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                                isActive
                                  ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300"
                                  : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                              }`}
                            >
                              {item.completed ? (
                                <CheckCircle2
                                  className="h-4 w-4 shrink-0 text-emerald-500"
                                  aria-hidden="true"
                                />
                              ) : isLocked ? (
                                <Lock
                                  className="h-3.5 w-3.5 shrink-0 text-zinc-400"
                                  aria-hidden="true"
                                />
                              ) : (
                                <PlayCircle
                                  className={`h-4 w-4 shrink-0 ${
                                    isActive
                                      ? "text-indigo-600 dark:text-indigo-400"
                                      : "text-zinc-400"
                                  }`}
                                  aria-hidden="true"
                                />
                              )}
                              <span className="flex-1 truncate">
                                {item.title}
                              </span>
                              {course.tier === "pro" && item.isFreePreview && (
                                <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                  Free
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </nav>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
