"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Show, SignInButton, useAuth, useUser } from "@clerk/nextjs";
import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import { toast } from "@ui-sdk/react/toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Clock,
  Crown,
  HelpCircle,
  Lock,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { usePageContext } from "@/components/PageContextProvider";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

function formatDuration(seconds: number): string {
  const mins = Math.max(1, Math.round(seconds / 60));
  return `${mins} min`;
}

export function CourseDetailClient({ slug }: { slug: string }) {
  const course = useQuery(api.courses.getCourseBySlug, { slug });
  const enroll = useMutation(api.enrollments.enroll);
  const { isAuthenticated } = useConvexAuth();
  const { has } = useAuth();
  const { user } = useUser();
  const { setPageDetail } = usePageContext();
  const [enrolling, setEnrolling] = useState(false);

  const isAdmin = isAdminRole(user?.publicMetadata);
  const clientHasPro = Boolean(
    has?.({ plan: PRO_PLAN_SLUG }) ||
      has?.({ feature: "pro_courses" }) ||
      isAdmin,
  );

  useEffect(() => {
    if (!course) return;
    setPageDetail({
      pageType: "course",
      pageTitle: course.title,
      courseSlug: course.slug,
      courseTitle: course.title,
      courseTier: course.tier,
    });
  }, [course, setPageDetail]);

  if (course === undefined) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-64 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="mt-8 space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
          Course not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          This course may be unpublished or moved.
        </p>
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Courses
        </Link>
      </div>
    );
  }

  const hasProAccess = course.hasProAccess || clientHasPro || course.isAdmin;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstLesson = allLessons[0] ?? null;
  const nextIncompleteLesson =
    allLessons.find((l) => !l.completed) ?? firstLesson;
  const progressPct =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;
  const freePreviewCount = allLessons.filter(
    (l) => course.tier === "free" || l.isFreePreview,
  ).length;

  async function handleEnroll() {
    if (!course) return;
    setEnrolling(true);
    try {
      await enroll({ courseId: course._id });
      toast.success(`Enrolled in ${course.title}!`);
    } catch {
      toast.error("Could not enroll. Please try again.");
    } finally {
      setEnrolling(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All Courses
      </Link>

      {/* Course Header */}
      <div className="mt-6 overflow-hidden rounded-3xl border border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900/70">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {course.tier === "pro" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  <Crown className="h-3.5 w-3.5" aria-hidden="true" />
                  Pro Course
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Free Course
                </span>
              )}
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {course.category}
              </span>
              <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium capitalize text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {course.level}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-white">
              {course.title}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-zinc-600 sm:text-base dark:text-zinc-400">
              {course.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-5 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                {course.modules.length} modules · {course.totalLessons} lessons
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" aria-hidden="true" />
                ~{course.estimatedHours} hours
              </span>
              {course.tier === "pro" && freePreviewCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  {freePreviewCount} free{" "}
                  {freePreviewCount === 1 ? "preview" : "previews"}
                </span>
              )}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              {nextIncompleteLesson && (
                <Link
                  href={`/courses/${course.slug}/lessons/${nextIncompleteLesson.slug}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
                >
                  <PlayCircle className="h-4 w-4" aria-hidden="true" />
                  {course.completedLessons > 0
                    ? "Continue Learning"
                    : course.tier === "pro" && !hasProAccess
                      ? "Watch Free Preview"
                      : "Start Course"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}

              <Authenticated>
                {course.isEnrolled ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/50 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Enrolled
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={enrolling}
                    onClick={handleEnroll}
                    className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    {enrolling ? "Enrolling..." : "Enroll in Course"}
                  </button>
                )}
              </Authenticated>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Sign in to Enroll
                  </button>
                </SignInButton>
              </Unauthenticated>

              {course.tier === "pro" && (
                <Show
                  when={(checkHas) =>
                    checkHas({ plan: PRO_PLAN_SLUG }) ||
                    checkHas({ feature: "pro_courses" }) ||
                    isAdmin
                  }
                  fallback={
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800/70 dark:bg-indigo-950/50 dark:text-indigo-300"
                    >
                      <Crown className="h-4 w-4" aria-hidden="true" />
                      Upgrade to Pro
                    </Link>
                  }
                >
                  {null}
                </Show>
              )}
            </div>
          </div>

          <div className="relative min-h-[220px] bg-zinc-100 lg:col-span-5 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {isAuthenticated && course.totalLessons > 0 && (
          <div className="border-t border-zinc-200/80 bg-zinc-50/70 px-6 py-4 sm:px-8 dark:border-zinc-800 dark:bg-zinc-950/50">
            <Progress value={progressPct} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <ProgressLabel className="text-zinc-700 dark:text-zinc-300">
                  Course Progress ({course.completedLessons} of{" "}
                  {course.totalLessons} lessons completed)
                </ProgressLabel>
                <ProgressValue className="font-mono text-zinc-600 dark:text-zinc-400" />
              </div>
              <ProgressTrack className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <ProgressIndicator className="h-full rounded-full bg-emerald-500 transition-all" />
              </ProgressTrack>
            </Progress>
          </div>
        )}
      </div>

      {/* Curriculum Modules */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
            Course Curriculum
          </h2>
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Taught by {course.tutorName}
          </span>
        </div>

        <Accordion
          multiple
          defaultValue={course.modules.map((m) => m._id)}
          className="mt-4 space-y-3"
        >
          {course.modules.map((mod) => (
            <AccordionItem
              key={mod._id}
              value={mod._id}
              className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900/60"
            >
              <AccordionHeader>
                <AccordionTrigger className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <div>
                    <p className="text-base font-semibold text-zinc-950 dark:text-white">
                      {mod.title}
                    </p>
                    {mod.description && (
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {mod.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {mod.lessons.length}{" "}
                      {mod.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-zinc-400 transition-transform duration-200 in-data-open:rotate-180"
                      aria-hidden="true"
                    />
                  </div>
                </AccordionTrigger>
              </AccordionHeader>

              <AccordionPanel className="border-t border-zinc-100 dark:border-zinc-800">
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {mod.lessons.map((lesson) => {
                    const locked =
                      course.tier === "pro" &&
                      !lesson.isFreePreview &&
                      !hasProAccess;
                    return (
                      <li key={lesson._id}>
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle2
                                className="h-5 w-5 shrink-0 text-emerald-500"
                                aria-hidden="true"
                              />
                            ) : locked ? (
                              <Lock
                                className="h-4.5 w-4.5 shrink-0 text-zinc-400"
                                aria-hidden="true"
                              />
                            ) : (
                              <PlayCircle
                                className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
                                aria-hidden="true"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {lesson.title}
                              </p>
                              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                                {lesson.summary}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2.5 text-xs">
                            {course.tier === "pro" && lesson.isFreePreview && (
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-700 dark:border-emerald-800/70 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Free Preview
                              </span>
                            )}
                            {lesson.quizCount > 0 && (
                              <span className="hidden items-center gap-1 rounded-md bg-zinc-100 px-2 py-0.5 text-zinc-600 sm:inline-flex dark:bg-zinc-800 dark:text-zinc-300">
                                <HelpCircle className="h-3 w-3" aria-hidden="true" />
                                Quiz
                              </span>
                            )}
                            <span className="font-mono text-zinc-400">
                              {formatDuration(lesson.durationSeconds)}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
