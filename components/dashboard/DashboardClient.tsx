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
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { PRO_PLAN_SLUG } from "@/lib/auth";

export function DashboardClient() {
  return (
    <>
      <AuthLoading>
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
            Sign in to view your learning dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Track enrolled courses, completed lessons, and quiz scores in real
            time.
          </p>
          <div className="mt-6">
            <SignInButton mode="modal">
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                Sign In
              </button>
            </SignInButton>
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
          <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
            Learner Dashboard
          </p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
            My Learning
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Track your enrolled courses, lesson completions, and quiz scores.
          </p>
        </div>

        {!isPro && (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500"
          >
            <Crown className="h-4 w-4" aria-hidden="true" />
            Upgrade to Pro (2 Months Free)
          </Link>
        )}
      </div>

      {/* Stats */}
      <dl className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <BookOpen className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            Enrolled Courses
          </dt>
          <dd className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {dashboard?.enrolledCourses.length ?? 0}
          </dd>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <CheckCircle2
              className="h-4 w-4 text-emerald-500"
              aria-hidden="true"
            />
            Lessons Completed
          </dt>
          <dd className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {dashboard?.totalCompletedLessons ?? 0}
          </dd>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <HelpCircle className="h-4 w-4 text-amber-500" aria-hidden="true" />
            Quizzes Taken
          </dt>
          <dd className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {dashboard?.totalQuizAttempts ?? 0}
          </dd>
        </div>

        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
          <dt className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Award className="h-4 w-4 text-indigo-500" aria-hidden="true" />
            Membership Tier
          </dt>
          <dd className="mt-2 text-2xl font-bold text-zinc-950 dark:text-white">
            {isPro ? "Pro" : "Free"}
          </dd>
        </div>
      </dl>

      {/* Enrolled Courses */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
            Enrolled Courses
          </h2>
          <Link
            href="/courses"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            Browse catalog →
          </Link>
        </div>

        {dashboard === undefined ? (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
            <div className="h-48 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
        ) : !dashboard || dashboard.enrolledCourses.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/40">
            <p className="text-base font-semibold text-zinc-950 dark:text-white">
              You haven&apos;t enrolled in any courses yet
            </p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Start a free course or try a free preview lesson to begin tracking
              your progress.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            {dashboard.enrolledCourses.map((course) => (
              <div
                key={course._id}
                className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/70"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {course.category}
                    </span>
                    {course.tier === "pro" && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                        <Crown className="h-3 w-3" aria-hidden="true" />
                        Pro
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-3 block text-lg font-semibold text-zinc-950 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                  >
                    {course.title}
                  </Link>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {course.subtitle}
                  </p>
                </div>

                <div className="mt-5 space-y-4">
                  <Progress value={course.progressPercent} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <ProgressLabel className="font-medium text-zinc-600 dark:text-zinc-400">
                        {course.completedLessons} / {course.totalLessons} lessons
                      </ProgressLabel>
                      <ProgressValue className="font-mono text-zinc-500" />
                    </div>
                    <ProgressTrack className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <ProgressIndicator className="h-full rounded-full bg-emerald-500 transition-all" />
                    </ProgressTrack>
                  </Progress>

                  {course.nextLessonSlug && (
                    <Link
                      href={`/courses/${course.slug}/lessons/${course.nextLessonSlug}`}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      <PlayCircle className="h-4 w-4" aria-hidden="true" />
                      Continue: {course.nextLessonTitle}
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
