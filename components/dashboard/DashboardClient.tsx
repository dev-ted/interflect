"use client";

import Link from "next/link";
import { SignInButton, useUser } from "@clerk/nextjs";
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
import { Play } from "lucide-react";
import { api } from "@/convex/_generated/api";

export function DashboardSkeleton() {
  return (
    <div className="motion-safe:animate-pulse" aria-hidden="true">
      <div className="h-9 w-64 max-w-full rounded-md bg-subtle" />
      <div className="mt-2 h-4 w-80 max-w-full rounded-md bg-subtle" />
      <div className="mt-8 h-24 rounded-xl bg-subtle" />
      <div className="mt-6 h-40 rounded-xl bg-subtle" />
      <div className="mt-10 h-64 rounded-xl bg-subtle" />
    </div>
  );
}

export function DashboardClient() {
  return (
    <>
      <AuthLoading>
        <DashboardSkeleton />
      </AuthLoading>

      <Unauthenticated>
        <div className="card mx-auto max-w-md p-8 text-center">
          <h1 className="text-2xl font-extrabold">Sign in to see your learning</h1>
          <p className="mt-2 text-sm text-mist">
            Your courses, completed lessons and quiz scores live here.
          </p>
          <SignInButton mode="modal">
            <button type="button" className="btn btn-primary mt-6">
              Sign in
            </button>
          </SignInButton>
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
  const { user } = useUser();

  if (dashboard === undefined) return <DashboardSkeleton />;

  const courses = dashboard?.enrolledCourses ?? [];
  const resume = courses.find(
    (c) => c.nextLessonSlug && c.completedLessons < c.totalLessons,
  );

  const stats = [
    { label: "Courses enrolled", value: courses.length },
    { label: "Lessons completed", value: dashboard?.totalCompletedLessons ?? 0 },
    { label: "Courses completed", value: dashboard?.completedCoursesCount ?? 0 },
    { label: "Quizzes taken", value: dashboard?.totalQuizAttempts ?? 0 },
  ];

  return (
    <>
      <h1 className="text-3xl font-extrabold">
        {user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back"}
      </h1>
      <p className="mt-1 text-mist">
        {courses.length > 0
          ? "Here's where you are in your courses."
          : "Enroll in a course and your progress shows up here."}
      </p>

      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface px-5 py-4">
            <dt className="text-sm text-mist">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-bold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {resume && (
        <section
          aria-labelledby="resume-heading"
          className="card mt-6 flex flex-col gap-5 p-5 sm:p-6 md:flex-row md:items-center"
        >
          <div className="min-w-0 flex-1">
            <h2 id="resume-heading" className="text-sm font-medium text-mist">
              Continue where you left off
            </h2>
            <p className="mt-1 text-xl font-bold">{resume.title}</p>
            <p className="mt-0.5 truncate text-sm text-mist">
              Next: {resume.nextLessonTitle}
            </p>
            <Progress value={resume.progressPercent} className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-xs">
                <ProgressLabel className="text-mist">
                  {resume.completedLessons} of {resume.totalLessons} lessons
                </ProgressLabel>
                <ProgressValue className="font-medium tabular-nums" />
              </div>
              <ProgressTrack className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-subtle">
                <ProgressIndicator className="h-full rounded-full bg-sun" />
              </ProgressTrack>
            </Progress>
          </div>
          <Link
            href={`/courses/${resume.slug}/lessons/${resume.nextLessonSlug}`}
            className="btn btn-primary btn-lg self-start md:self-center"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            Continue
          </Link>
        </section>
      )}

      <section aria-labelledby="courses-heading" className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 id="courses-heading" className="text-xl font-bold">
            Your courses
          </h2>
          {courses.length > 0 && (
            <Link href="/courses" className="btn btn-ghost btn-sm">
              Browse courses
            </Link>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-line p-10 text-center">
            <p className="font-semibold">You haven&apos;t started a course yet</p>
            <p className="mt-1 text-sm text-mist">
              Pick a free course or try a preview lesson to get going.
            </p>
            <Link href="/courses" className="btn btn-primary mt-5">
              Browse courses
            </Link>
          </div>
        ) : (
          <ul className="card mt-4 divide-y divide-line">
            {courses.map((course) => {
              const done =
                course.totalLessons > 0 &&
                course.completedLessons === course.totalLessons;
              return (
                <li
                  key={course._id}
                  className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-6"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/courses/${course.slug}`}
                      className="font-semibold hover:text-primary"
                    >
                      {course.title}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-2 text-sm text-mist">
                      <span className="truncate">{course.category}</span>
                      {course.tier === "pro" && <span className="chip">Pro</span>}
                    </p>
                  </div>

                  <Progress
                    value={course.progressPercent}
                    className="w-full sm:w-48"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <ProgressLabel className={done ? "text-sage" : "text-mist"}>
                        {done
                          ? "Completed"
                          : `${course.completedLessons} of ${course.totalLessons} lessons`}
                      </ProgressLabel>
                      <ProgressValue className="tabular-nums text-mist" />
                    </div>
                    <ProgressTrack className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                      <ProgressIndicator
                        className={`h-full rounded-full ${done ? "bg-sage" : "bg-primary"}`}
                      />
                    </ProgressTrack>
                  </Progress>

                  {!done && course.nextLessonSlug && (
                    <Link
                      href={`/courses/${course.slug}/lessons/${course.nextLessonSlug}`}
                      aria-label={`Continue ${course.title}`}
                      className="btn btn-secondary btn-sm self-start sm:self-center"
                    >
                      Continue
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
