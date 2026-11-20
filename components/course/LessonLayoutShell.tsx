"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CheckCircle2,
  ListTree,
  Lock,
  PlayCircle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  SidebarMobileDrawer,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

function CourseOutlineList({
  course,
  activeLessonSlug,
  hasProAccess,
  closeMobileOnSelect = false,
}: {
  course: {
    slug: string;
    tier: "free" | "pro";
    modules: Array<{
      _id: string;
      title: string;
      lessons: Array<{
        _id: string;
        slug: string;
        title: string;
        isFreePreview: boolean;
        completed: boolean;
      }>;
    }>;
  };
  activeLessonSlug: string | null;
  hasProAccess: boolean;
  closeMobileOnSelect?: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  return (
    <div className="divide-y divide-[#E6DCC6] dark:divide-[#2A2A3B]">
      {course.modules.map((mod, modIdx) => (
        <div key={mod._id} className="p-4">
          <p className="flex items-center gap-2 text-xs font-extrabold tracking-wide text-[#52525B] uppercase dark:text-[#B4B4C6]">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-[#18181B] bg-[#FFB800] font-mono text-[10px] font-extrabold text-[#111116]">
              {modIdx + 1}
            </span>
            <span className="truncate">{mod.title}</span>
          </p>
          <ul className="mt-2.5 space-y-1">
            {mod.lessons.map((item) => {
              const isActive = item.slug === activeLessonSlug;
              const isLocked =
                course.tier === "pro" && !item.isFreePreview && !hasProAccess;
              return (
                <li key={item._id}>
                  <Link
                    href={`/courses/${course.slug}/lessons/${item.slug}`}
                    scroll={false}
                    onClick={() => {
                      if (closeMobileOnSelect) setOpenMobile(false);
                    }}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-11 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                      isActive
                        ? "border-2 border-[#18181B] bg-[#FFB800] font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]"
                        : "border-2 border-transparent font-medium text-[#111116] hover:bg-[#F6EFE0] dark:text-[#E4E4EE] dark:hover:bg-[#1F1F2D]"
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2
                        className={`h-4 w-4 shrink-0 ${
                          isActive ? "text-[#111116]" : "text-[#00B87C]"
                        }`}
                        aria-hidden="true"
                      />
                    ) : isLocked ? (
                      <Lock
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-[#111116]" : "text-[#71717A]"
                        }`}
                        aria-hidden="true"
                      />
                    ) : (
                      <PlayCircle
                        className={`h-4 w-4 shrink-0 ${
                          isActive
                            ? "text-[#111116]"
                            : "text-[#D93817] dark:text-[#FF6B4A]"
                        }`}
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate">
                      {item.title}
                    </span>
                    {course.tier === "pro" && item.isFreePreview && (
                      <span
                        className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-extrabold ${
                          isActive
                            ? "border-[#18181B] bg-white text-[#111116]"
                            : "border-[#18181B]/30 bg-[#00B87C] text-[#111116]"
                        }`}
                      >
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
    </div>
  );
}

function LessonLayoutInner({ children }: { children: ReactNode }) {
  const params = useParams<{ slug?: string; lessonSlug?: string }>();
  const courseSlug = typeof params.slug === "string" ? params.slug : "";
  const activeLessonSlug =
    typeof params.lessonSlug === "string" ? params.lessonSlug : null;

  // Subscribes ONLY to `courseSlug`, so switching between lessons inside the
  // same course keeps this layout, its Convex subscription, and the sidebar
  // scroll position mounted without re-fetching or flashing skeletons.
  const course = useQuery(
    api.courses.getCourseBySlug,
    courseSlug ? { slug: courseSlug } : "skip",
  );
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
        {/* Persistent single-line Breadcrumb & Mobile Outline Drawer Trigger */}
        <div className="mb-5 flex min-h-11 flex-nowrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm text-[#52525B] dark:text-[#B4B4C6]">
            <div className="lg:hidden">
              <SidebarMobileDrawer
                title="Course Outline"
                description={
                  course
                    ? `${completedCount}/${totalLessons} lessons completed (${progressPct}%)`
                    : "Course lessons"
                }
                triggerLabel="Lessons"
                triggerContent={
                  <>
                    <ListTree className="h-4 w-4" aria-hidden="true" />
                    <span className="text-xs font-extrabold">Lessons</span>
                  </>
                }
              >
                {course === undefined ? (
                  <div className="space-y-3 p-4">
                    <div className="h-10 animate-pulse rounded-xl bg-[#F6EFE0] dark:bg-[#1F1F2D]" />
                    <div className="h-10 animate-pulse rounded-xl bg-[#F6EFE0] dark:bg-[#1F1F2D]" />
                  </div>
                ) : course === null ? (
                  <div className="p-5 text-sm text-[#52525B] dark:text-[#B4B4C6]">
                    Course curriculum unavailable.
                  </div>
                ) : (
                  <nav aria-label="Course lessons drawer">
                    <div className="border-b-2 border-[#18181B]/15 px-4 py-3 dark:border-[#2A2A3B]">
                      <div className="h-2.5 w-full overflow-clip rounded-full border border-[#18181B] bg-[#F6EFE0] dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
                        <div
                          className="h-full rounded-full bg-[#00B87C] transition-[width] duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                    <CourseOutlineList
                      course={course}
                      activeLessonSlug={activeLessonSlug}
                      hasProAccess={hasProAccess}
                      closeMobileOnSelect
                    />
                  </nav>
                )}
              </SidebarMobileDrawer>
            </div>

            <Link
              href={courseSlug ? `/courses/${courseSlug}` : "/courses"}
              className="inline-flex min-w-0 shrink items-center gap-1.5 font-bold text-[#111116] transition-colors hover:text-[#D93817] dark:text-[#FAFAF5] dark:hover:text-[#FF6B4A]"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">
                {course ? course.title : "Back to Course"}
              </span>
            </Link>
            {activeModule && (
              <>
                <span className="hidden shrink-0 sm:inline" aria-hidden="true">
                  /
                </span>
                <span className="hidden truncate font-medium sm:inline">
                  {activeModule.title}
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {course?.tier === "pro" && activeLesson?.isFreePreview && (
              <span className="hidden rounded-full border-2 border-[#18181B] bg-[#00B87C] px-2.5 py-0.5 text-xs font-extrabold text-[#111116] sm:inline-flex">
                Free Preview
              </span>
            )}
            {course && (
              <span className="rounded-lg border-2 border-[#18181B] bg-white px-2.5 py-1 font-mono text-xs font-bold whitespace-nowrap text-[#111116] tabular-nums shadow-[2px_2px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#FAFAF5] dark:shadow-[2px_2px_0_0_#000000]">
                {completedCount}/{totalLessons} ({progressPct}%)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Dynamic Lesson Content Slot (`min-w-0` keeps 8-col grid track locked even with wide code blocks) */}
          <div className="min-w-0 lg:col-span-8">{children}</div>

          {/* Persistent Desktop Course Outline Sidebar */}
          <aside className="tactile-card sticky top-22 hidden min-w-0 overflow-clip rounded-2xl lg:col-span-4 lg:block">
            <div className="border-b-2 border-[#18181B] bg-[#F6EFE0]/80 px-5 py-4 dark:border-[#323244] dark:bg-[#12121A]">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                  Course Outline
                </h2>
                <span className="font-mono text-xs font-bold text-[#047857] dark:text-[#34D399]">
                  {progressPct}%
                </span>
              </div>
              <div className="mt-2.5 h-2.5 w-full overflow-clip rounded-full border border-[#18181B] bg-white dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
                <div
                  className="h-full rounded-full bg-[#00B87C] transition-[width] duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {course === undefined ? (
              <div className="space-y-3 p-4">
                <div className="h-10 animate-pulse rounded-xl bg-[#F6EFE0] dark:bg-[#1F1F2D]" />
                <div className="h-10 animate-pulse rounded-xl bg-[#F6EFE0] dark:bg-[#1F1F2D]" />
                <div className="h-10 animate-pulse rounded-xl bg-[#F6EFE0] dark:bg-[#1F1F2D]" />
              </div>
            ) : course === null ? (
              <div className="p-5 text-sm text-[#52525B] dark:text-[#B4B4C6]">
                Course curriculum unavailable.
              </div>
            ) : (
              <nav
                aria-label="Course lessons"
                className="max-h-[70dvh] overflow-y-auto overscroll-contain [scrollbar-gutter:stable]"
              >
                <CourseOutlineList
                  course={course}
                  activeLessonSlug={activeLessonSlug}
                  hasProAccess={hasProAccess}
                />
              </nav>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

export function LessonLayoutShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider side="left">
      <LessonLayoutInner>{children}</LessonLayoutInner>
    </SidebarProvider>
  );
}
