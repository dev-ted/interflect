"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@ui-sdk/react/collapsible";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import { CheckCircle2, ListOrdered, Lock, PlayCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import {
  SidebarMobileDrawer,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

type OutlineCourse = {
  slug: string;
  tier: "free" | "pro";
  totalLessons: number;
  completedLessons: number;
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

function CourseOutline({
  course,
  activeLessonSlug,
  hasProAccess,
  closeMobileOnSelect = false,
}: {
  course: OutlineCourse | null | undefined;
  activeLessonSlug: string | null;
  hasProAccess: boolean;
  closeMobileOnSelect?: boolean;
}) {
  const { setOpenMobile } = useSidebar();

  if (course === undefined) {
    return (
      <div className="space-y-2 p-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-9 animate-pulse rounded-md bg-subtle motion-reduce:animate-none" />
        ))}
      </div>
    );
  }
  if (course === null) {
    return <p className="p-4 text-sm text-mist">Lessons are unavailable.</p>;
  }

  const pct =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;

  return (
    <>
      <Progress value={pct} className="block border-b border-line p-4">
        <div className="flex items-baseline justify-between gap-2 text-sm">
          <ProgressLabel className="font-semibold">
            {course.completedLessons} of {course.totalLessons} lessons done
          </ProgressLabel>
          <ProgressValue className="text-mist tabular-nums" />
        </div>
        <ProgressTrack className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
          <ProgressIndicator className="h-full rounded-full bg-sun" />
        </ProgressTrack>
      </Progress>

      <nav aria-label="Course lessons">
        <ol className="space-y-4 p-3">
          {course.modules.map((mod) => (
            <li key={mod._id}>
              <p className="px-2 pb-1.5 text-xs font-semibold text-mist">{mod.title}</p>
              <ol className="space-y-0.5">
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
                        className={`flex min-h-10 items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors duration-150 ${
                          isActive
                            ? "bg-subtle font-semibold text-ink"
                            : "text-mist hover:bg-subtle hover:text-ink"
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                        ) : isLocked ? (
                          <Lock className="h-4 w-4 shrink-0 p-px" aria-hidden="true" />
                        ) : (
                          <PlayCircle
                            className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : ""}`}
                            aria-hidden="true"
                          />
                        )}
                        <span className="min-w-0 flex-1 truncate">
                          {item.title}
                          {item.completed && <span className="sr-only"> (completed)</span>}
                          {isLocked && <span className="sr-only"> (Pro)</span>}
                        </span>
                        {course.tier === "pro" && item.isFreePreview && (
                          <span className="chip h-5 px-2">Free</span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}

function LessonLayoutInner({ children }: { children: ReactNode }) {
  const params = useParams<{ slug?: string; lessonSlug?: string }>();
  const courseSlug = typeof params.slug === "string" ? params.slug : "";
  const activeLessonSlug =
    typeof params.lessonSlug === "string" ? params.lessonSlug : null;

  // Subscribes ONLY to `courseSlug`, so switching between lessons inside the
  // same course keeps this layout, its Convex subscription, and the outline
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

  return (
    <Collapsible
      defaultOpen
      render={<main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10" />}
    >
      <div className="mb-6 flex min-h-10 items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="min-w-0 text-sm text-mist">
          <ol className="flex min-w-0 items-center gap-2">
            <li className="hidden shrink-0 sm:block">
              <Link href="/courses" className="hover:text-ink">
                Courses
              </Link>
            </li>
            <li aria-hidden="true" className="hidden sm:block">
              /
            </li>
            <li className="min-w-0 truncate">
              <Link
                href={courseSlug ? `/courses/${courseSlug}` : "/courses"}
                className="font-medium text-ink hover:text-primary"
              >
                {course ? course.title : "Course"}
              </Link>
            </li>
            {activeModule && (
              <>
                <li aria-hidden="true" className="hidden md:block">
                  /
                </li>
                <li className="hidden min-w-0 truncate md:block">{activeModule.title}</li>
              </>
            )}
          </ol>
        </nav>

        <div className="shrink-0 xl:hidden">
          <SidebarMobileDrawer
            title="Lessons"
            description={course?.title}
            triggerLabel="Lessons"
            triggerContent={
              <>
                <ListOrdered className="h-4 w-4" aria-hidden="true" />
                Lessons
              </>
            }
          >
            <CourseOutline
              course={course}
              activeLessonSlug={activeLessonSlug}
              hasProAccess={hasProAccess}
              closeMobileOnSelect
            />
          </SidebarMobileDrawer>
        </div>

        <CollapsibleTrigger className="btn btn-secondary btn-sm hidden shrink-0 xl:inline-flex">
          <ListOrdered className="h-4 w-4" aria-hidden="true" />
          <span className="in-data-open:hidden">Show lessons</span>
          <span className="hidden in-data-open:inline">Hide lessons</span>
        </CollapsibleTrigger>
      </div>

      <div className="flex items-start">
        <div className="min-w-0 flex-1">{children}</div>

        <div className="sticky top-6 hidden shrink-0 xl:block">
          <CollapsiblePanel className="ml-8 w-80 transition-opacity duration-200 ease-(--ease-out) data-ending-style:opacity-0 data-starting-style:opacity-0">
            <div className="card max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain">
              <CourseOutline
                course={course}
                activeLessonSlug={activeLessonSlug}
                hasProAccess={hasProAccess}
              />
            </div>
          </CollapsiblePanel>
        </div>
      </div>
    </Collapsible>
  );
}

export function LessonLayoutShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider side="right">
      <LessonLayoutInner>{children}</LessonLayoutInner>
    </SidebarProvider>
  );
}
