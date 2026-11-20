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
        <div className="h-64 animate-pulse rounded-3xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
        <div className="mt-8 space-y-4">
          <div className="h-24 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
          <div className="h-24 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
        </div>
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <div className="tactile-card rounded-3xl p-10">
          <h1 className="text-2xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            Course not found
          </h1>
          <p className="mt-2 text-sm text-[#52525B] dark:text-[#B4B4C6]">
            This course may be unpublished or moved.
          </p>
          <Link
            href="/courses"
            className="tactile-btn mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Courses
          </Link>
        </div>
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
        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-bold text-[#52525B] transition-colors hover:bg-[#F6EFE0] hover:text-[#111116] dark:text-[#B4B4C6] dark:hover:bg-[#16161F] dark:hover:text-[#FAFAF5]"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        All Courses
      </Link>

      {/* Course Header */}
      <div className="tactile-card-lg mt-5 overflow-hidden rounded-3xl">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2">
              {course.tier === "pro" ? (
                <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#2563EB] px-3 py-0.5 text-xs font-extrabold text-white shadow-[2px_2px_0_0_#111116]">
                  <Crown className="h-3.5 w-3.5 text-[#FFB800]" aria-hidden="true" />
                  Pro Course
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#00B87C] px-3 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Free Course
                </span>
              )}
              <span className="rounded-full border-2 border-[#18181B]/25 bg-[#F6EFE0] px-3 py-0.5 text-xs font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
                {course.category}
              </span>
              <span className="rounded-full border-2 border-[#18181B]/25 bg-[#F6EFE0] px-3 py-0.5 text-xs font-bold capitalize text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
                {course.level}
              </span>
            </div>

            <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#111116] sm:text-3xl dark:text-[#FAFAF5]">
              {course.title}
            </h1>
            <p className="mt-2.5 text-sm leading-relaxed text-[#52525B] sm:text-base dark:text-[#B4B4C6]">
              {course.description}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
              <span className="inline-flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#D93817] dark:text-[#FF6B4A]" aria-hidden="true" />
                {course.modules.length} modules · {course.totalLessons} lessons
              </span>
              <span className="inline-flex items-center gap-1.5 font-mono">
                <Clock className="h-4 w-4 text-[#1D4ED8] dark:text-[#60A5FA]" aria-hidden="true" />
                ~{course.estimatedHours} hours
              </span>
              {course.tier === "pro" && freePreviewCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-[#047857] dark:text-[#34D399]">
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
                  className="tactile-btn inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
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
                  <span className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border-2 border-[#18181B] bg-[#00B87C] px-4 py-2.5 text-sm font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Enrolled
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={enrolling}
                    onClick={handleEnroll}
                    className="tactile-btn-sm min-h-11 cursor-pointer rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#111116] hover:bg-[#F6EFE0] disabled:opacity-50 dark:bg-[#1F1F2D] dark:text-[#FAFAF5] dark:hover:bg-[#2A2A3B]"
                  >
                    {enrolling ? "Enrolling..." : "Enroll in Course"}
                  </button>
                )}
              </Authenticated>

              <Unauthenticated>
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="tactile-btn-sm min-h-11 cursor-pointer rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#111116] hover:bg-[#F6EFE0] dark:bg-[#1F1F2D] dark:text-[#FAFAF5] dark:hover:bg-[#2A2A3B]"
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
                      className="tactile-btn-sm inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#1D4ED8]"
                    >
                      <Crown className="h-4 w-4 text-[#FFB800]" aria-hidden="true" />
                      Upgrade to Pro
                    </Link>
                  }
                >
                  {null}
                </Show>
              )}
            </div>
          </div>

          <div className="relative min-h-[220px] border-t-2 border-[#18181B] bg-[#F6EFE0] lg:col-span-5 lg:border-t-0 lg:border-l-2 dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {isAuthenticated && course.totalLessons > 0 && (
          <div className="border-t-2 border-[#18181B] bg-[#F6EFE0]/80 px-6 py-4 sm:px-8 dark:border-[#323244] dark:bg-[#12121A]">
            <Progress value={progressPct} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <ProgressLabel className="text-[#111116] dark:text-[#FAFAF5]">
                  Course Progress ({course.completedLessons} of{" "}
                  {course.totalLessons} lessons completed)
                </ProgressLabel>
                <ProgressValue className="font-mono text-[#047857] dark:text-[#34D399]" />
              </div>
              <ProgressTrack className="h-3 w-full overflow-hidden rounded-full border-2 border-[#18181B] bg-white dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
                <ProgressIndicator className="h-full rounded-full bg-[#00B87C] transition-all" />
              </ProgressTrack>
            </Progress>
          </div>
        )}
      </div>

      {/* Curriculum Modules */}
      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#111116] dark:text-[#FAFAF5]">
            Course Curriculum
          </h2>
          <span className="rounded-full border-2 border-[#18181B]/25 bg-[#F6EFE0] px-3 py-0.5 text-xs font-bold text-[#52525B] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6]">
            Taught by {course.tutorName}
          </span>
        </div>

        <Accordion
          multiple
          defaultValue={course.modules.map((m) => m._id)}
          className="mt-5 space-y-4"
        >
          {course.modules.map((mod, modIndex) => (
            <AccordionItem
              key={mod._id}
              value={mod._id}
              className="tactile-card overflow-hidden rounded-2xl"
            >
              <AccordionHeader>
                <AccordionTrigger className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[#FFFBF2] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#2563EB] dark:hover:bg-[#1F1F2D]">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-[#18181B] bg-[#FFB800] font-mono text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
                      {String(modIndex + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="font-display text-base font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                        {mod.title}
                      </p>
                      {mod.description && (
                        <p className="mt-0.5 text-xs text-[#52525B] dark:text-[#B4B4C6]">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="rounded-lg border border-[#18181B]/20 bg-[#F6EFE0] px-2.5 py-0.5 font-mono text-xs font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
                      {mod.lessons.length}{" "}
                      {mod.lessons.length === 1 ? "lesson" : "lessons"}
                    </span>
                    <ChevronDown
                      className="h-4 w-4 text-[#52525B] transition-transform duration-200 in-data-open:rotate-180 dark:text-[#B4B4C6]"
                      aria-hidden="true"
                    />
                  </div>
                </AccordionTrigger>
              </AccordionHeader>

              <AccordionPanel className="border-t-2 border-[#18181B]/15 dark:border-[#2A2A3B]">
                <ul className="divide-y divide-[#E6DCC6] dark:divide-[#2A2A3B]">
                  {mod.lessons.map((lesson) => {
                    const locked =
                      course.tier === "pro" &&
                      !lesson.isFreePreview &&
                      !hasProAccess;
                    return (
                      <li key={lesson._id}>
                        <Link
                          href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                          className="flex min-h-14 items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-[#FFFBF2] dark:hover:bg-[#1F1F2D]/70"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            {lesson.completed ? (
                              <CheckCircle2
                                className="h-5 w-5 shrink-0 text-[#00B87C]"
                                aria-hidden="true"
                              />
                            ) : locked ? (
                              <Lock
                                className="h-4.5 w-4.5 shrink-0 text-[#71717A]"
                                aria-hidden="true"
                              />
                            ) : (
                              <PlayCircle
                                className="h-5 w-5 shrink-0 text-[#D93817] dark:text-[#FF6B4A]"
                                aria-hidden="true"
                              />
                            )}
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-[#111116] dark:text-[#FAFAF5]">
                                {lesson.title}
                              </p>
                              <p className="truncate text-xs text-[#52525B] dark:text-[#B4B4C6]">
                                {lesson.summary}
                              </p>
                            </div>
                          </div>

                          <div className="flex shrink-0 items-center gap-2.5 text-xs">
                            {course.tier === "pro" && lesson.isFreePreview && (
                              <span className="rounded-full border border-[#18181B] bg-[#00B87C] px-2.5 py-0.5 font-extrabold text-[#111116]">
                                Free Preview
                              </span>
                            )}
                            {lesson.quizCount > 0 && (
                              <span className="hidden items-center gap-1 rounded-md border border-[#18181B]/20 bg-[#FFB800]/25 px-2 py-0.5 font-bold text-[#111116] sm:inline-flex dark:border-[#FFB800]/40 dark:bg-[#FFB800]/15 dark:text-[#FFD166]">
                                <HelpCircle className="h-3 w-3" aria-hidden="true" />
                                Quiz
                              </span>
                            )}
                            <span className="font-mono font-semibold text-[#52525B] dark:text-[#B4B4C6]">
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
