"use client";

import Link from "next/link";
import { SignInButton, useAuth } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Crown,
  HelpCircle,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { PRO_PLAN_SLUG } from "@/lib/auth";

export function DashboardClient() {
  return (
    <>
      <AuthLoading>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-24 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="h-28 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
            <div className="h-28 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
            <div className="h-28 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
            <div className="h-28 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="tactile-card-lg rounded-3xl p-10">
            <span className="mx-auto flex h-12 w-12 -rotate-3 items-center justify-center rounded-2xl border-2 border-[#18181B] bg-[#FFB800] text-[#111116] shadow-[3px_3px_0_0_#111116]">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
              Sign in to view your learning dashboard
            </h1>
            <p className="mt-2 text-sm text-[#52525B] dark:text-[#B4B4C6]">
              Track enrolled courses, completed lessons, and quiz scores in real
              time.
            </p>
            <div className="mt-6">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="tactile-btn min-h-11 cursor-pointer rounded-xl bg-[#FF5A36] px-6 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
                >
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <AuthenticatedDashboardContent />
      </Authenticated>
    </>
  );
}

function AuthenticatedDashboardContent() {
  const dashboard = useQuery(api.enrollments.getMyLearningDashboard, {});
  const { has } = useAuth();
  const isPro = Boolean(
    has?.({ plan: PRO_PLAN_SLUG }) || has?.({ feature: "pro_courses" }),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex -rotate-1 items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#111116] uppercase shadow-[2px_2px_0_0_#111116]">
            Learner Dashboard
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111116] sm:text-4xl dark:text-[#FAFAF5]">
            My Learning
          </h1>
          <p className="mt-1 text-sm text-[#52525B] dark:text-[#B4B4C6]">
            Track your enrolled courses, lesson completions, and quiz scores.
          </p>
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="tactile-btn inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#1D4ED8]"
          >
            <Crown className="h-4 w-4 text-[#FFB800]" aria-hidden="true" />
            Upgrade to Pro (2 Months Free)
          </Link>
        )}
      </div>

      {/* Stats */}
      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="tactile-card rounded-2xl p-5">
          <dt className="flex items-center gap-2 text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#18181B] bg-[#2563EB] text-white">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            Enrolled Courses
          </dt>
          <dd className="font-display mt-3 text-3xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            {dashboard?.enrolledCourses.length ?? 0}
          </dd>
        </div>

        <div className="tactile-card rounded-2xl p-5">
          <dt className="flex items-center gap-2 text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#18181B] bg-[#00B87C] text-[#111116]">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            Lessons Completed
          </dt>
          <dd className="font-display mt-3 text-3xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            {dashboard?.totalCompletedLessons ?? 0}
          </dd>
        </div>

        <div className="tactile-card rounded-2xl p-5">
          <dt className="flex items-center gap-2 text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#18181B] bg-[#FFB800] text-[#111116]">
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            Quizzes Taken
          </dt>
          <dd className="font-display mt-3 text-3xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            {dashboard?.totalQuizAttempts ?? 0}
          </dd>
        </div>

        <div className="tactile-card rounded-2xl p-5">
          <dt className="flex items-center gap-2 text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border-2 border-[#18181B] bg-[#FF5A36] text-[#111116]">
              <Award className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
            Membership Tier
          </dt>
          <dd className="font-display mt-3 text-3xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            {isPro ? "Pro" : "Free"}
          </dd>
        </div>
      </dl>

      {/* Enrolled Courses */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            Enrolled Courses
          </h2>
          <Link
            href="/courses"
            className="text-sm font-extrabold text-[#D93817] hover:underline decoration-2 underline-offset-4 dark:text-[#FF6B4A]"
          >
            Browse catalog →
          </Link>
        </div>

        {dashboard === undefined ? (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
            <div className="h-48 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
          </div>
        ) : !dashboard || dashboard.enrolledCourses.length === 0 ? (
          <div className="mt-4 rounded-3xl border-2 border-dashed border-[#18181B]/35 bg-white p-12 text-center dark:border-[#3A3A52] dark:bg-[#16161F]">
            <p className="font-display text-lg font-extrabold text-[#111116] dark:text-[#FAFAF5]">
              You haven&apos;t enrolled in any courses yet
            </p>
            <p className="mt-1 text-sm text-[#52525B] dark:text-[#B4B4C6]">
              Start a free course or try a free preview lesson to begin tracking
              your progress.
            </p>
            <Link
              href="/courses"
              className="tactile-btn mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
            {dashboard.enrolledCourses.map((course) => (
              <div
                key={course._id}
                className="tactile-card tactile-card-interactive flex flex-col justify-between rounded-2xl p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-lg border border-[#18181B]/20 bg-[#F6EFE0] px-2.5 py-0.5 text-xs font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
                      {course.category}
                    </span>
                    {course.tier === "pro" && (
                      <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#2563EB] px-2.5 py-0.5 text-xs font-extrabold text-white">
                        <Crown className="h-3 w-3 text-[#FFB800]" aria-hidden="true" />
                        PRO
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="font-display mt-3 block text-lg font-extrabold text-[#111116] transition-colors hover:text-[#D93817] dark:text-[#FAFAF5] dark:hover:text-[#FF6B4A]"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-[#52525B] dark:text-[#B4B4C6]">
                    {course.subtitle}
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <Progress value={course.progressPercent} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <ProgressLabel className="text-[#52525B] dark:text-[#B4B4C6]">
                        {course.completedLessons} / {course.totalLessons} lessons
                      </ProgressLabel>
                      <ProgressValue className="font-mono text-[#047857] dark:text-[#34D399]" />
                    </div>
                    <ProgressTrack className="h-2.5 w-full overflow-hidden rounded-full border border-[#18181B] bg-[#F6EFE0] dark:border-[#3A3A52] dark:bg-[#1F1F2D]">
                      <ProgressIndicator className="h-full rounded-full bg-[#00B87C] transition-all" />
                    </ProgressTrack>
                  </Progress>

                  {course.nextLessonSlug && (
                    <Link
                      href={`/courses/${course.slug}/lessons/${course.nextLessonSlug}`}
                      className="tactile-btn-sm inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#FF5A36] px-4 py-2 text-xs font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
                    >
                      <PlayCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        Continue: {course.nextLessonTitle}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
