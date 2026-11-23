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
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@ui-sdk/react/progress";
import { toast } from "@ui-sdk/react/toast";
import { CheckCircle2, Crown, Lock, PlayCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { TrackButton } from "@/components/dashboard/TrackButton";
import { usePageContext } from "@/components/PageContextProvider";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";

function formatDuration(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
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
      <div className="space-y-6">
        <div className="h-72 animate-pulse rounded-3xl bg-subtle motion-reduce:animate-none" />
        <div className="h-48 animate-pulse rounded-xl bg-subtle motion-reduce:animate-none" />
      </div>
    );
  }

  if (course === null) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold">Course not found</h1>
        <p className="mt-2 text-sm text-mist">
          It may have been unpublished or moved.
        </p>
        <Link href="/courses" className="btn btn-primary mt-6">
          Browse courses
        </Link>
      </div>
    );
  }

  const isPro = course.tier === "pro";
  const hasProAccess = course.hasProAccess || clientHasPro || course.isAdmin;
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const previewOnly = isPro && !hasProAccess;
  const startLesson = previewOnly
    ? (allLessons.find((l) => l.isFreePreview) ?? allLessons[0])
    : (allLessons.find((l) => !l.completed) ?? allLessons[0]);
  const progressPct =
    course.totalLessons > 0
      ? Math.round((course.completedLessons / course.totalLessons) * 100)
      : 0;
  const freePreviewCount = allLessons.filter((l) => l.isFreePreview).length;
  const quizCount = allLessons.filter((l) => l.quizCount > 0).length;
  const videoMinutes = Math.round(
    allLessons.reduce((sum, l) => sum + l.durationSeconds, 0) / 60,
  );

  async function handleEnroll() {
    if (!course) return;
    setEnrolling(true);
    try {
      await enroll({ courseId: course._id });
      toast.success(`You're enrolled in ${course.title}.`);
    } catch {
      toast.error("Could not enroll. Try again.");
    } finally {
      setEnrolling(false);
    }
  }

  const lessonLink = startLesson && (
    <Link
      href={`/courses/${course.slug}/lessons/${startLesson.slug}`}
      className={`btn btn-lg ${course.isEnrolled ? "btn-primary" : "btn-secondary"}`}
    >
      <PlayCircle className="h-4 w-4" aria-hidden="true" />
      {course.completedLessons > 0
        ? "Continue learning"
        : previewOnly
          ? "Watch free preview"
          : "Start course"}
    </Link>
  );

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-mist">
        <ol className="flex min-w-0 items-center gap-2">
          <li>
            <Link href="/courses" className="hover:text-ink">
              Courses
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate text-ink">
            {course.title}
          </li>
        </ol>
      </nav>

      <header className="relative grid gap-8 overflow-hidden rounded-[20px] border border-line bg-subtle p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            {isPro ? (
              <span className="chip text-ink">
                <Crown className="h-3.5 w-3.5 text-sun" aria-hidden="true" />
                Pro
              </span>
            ) : (
              <span className="chip">Free</span>
            )}
            <span className="chip capitalize">{course.level}</span>
            <span className="chip">{course.category}</span>
            <span className="chip">{course.estimatedHours} hours</span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-3 max-w-2xl text-mist sm:text-lg">{course.subtitle}</p>
          <p className="mt-4 text-sm text-mist">
            By <span className="font-semibold text-ink">{course.tutorName}</span>
            {course.tutorTitle && `, ${course.tutorTitle}`}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Authenticated>
              {!course.isEnrolled && (
                <button
                  type="button"
                  disabled={enrolling}
                  onClick={handleEnroll}
                  className="btn btn-primary btn-lg"
                >
                  {enrolling ? "Enrolling…" : "Enroll"}
                </button>
              )}
            </Authenticated>
            <Unauthenticated>
              <SignInButton mode="modal">
                <button type="button" className="btn btn-primary btn-lg">
                  Sign in to enroll
                </button>
              </SignInButton>
            </Unauthenticated>

            {lessonLink}

            <Authenticated>
              <TrackButton courseId={course._id} className="btn btn-ghost btn-lg" />
            </Authenticated>

            {isPro && (
              <Show
                when={(checkHas) =>
                  checkHas({ plan: PRO_PLAN_SLUG }) ||
                  checkHas({ feature: "pro_courses" }) ||
                  isAdmin
                }
                fallback={
                  <Link href="/pricing" className="btn btn-ghost btn-lg">
                    Upgrade for Pro lessons
                  </Link>
                }
              >
                {null}
              </Show>
            )}
          </div>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={course.thumbnailUrl}
          alt=""
          className="aspect-video w-full rounded-xl object-cover"
        />
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="text-xl font-bold">
              About this course
            </h2>
            <p className="mt-3 max-w-[70ch] leading-relaxed whitespace-pre-line text-mist">
              {course.description}
            </p>
          </section>

          <section aria-labelledby="curriculum-heading" className="mt-10">
            <h2 id="curriculum-heading" className="text-xl font-bold">
              Curriculum
            </h2>
            <p className="mt-1 text-sm text-mist">
              {plural(course.modules.length, "module")},{" "}
              {plural(course.totalLessons, "lesson")}
            </p>

            <ol className="mt-5 space-y-6">
              {course.modules.map((mod, modIndex) => (
                <li key={mod._id}>
                  <h3 className="flex items-baseline gap-3 font-semibold">
                    <span className="text-sm text-mist tabular-nums">
                      {modIndex + 1}
                    </span>
                    {mod.title}
                  </h3>
                  {mod.description && (
                    <p className="mt-1 ml-6 text-sm text-mist">{mod.description}</p>
                  )}

                  <ol className="card mt-3 divide-y divide-line overflow-hidden">
                    {mod.lessons.map((lesson) => {
                      const locked = isPro && !lesson.isFreePreview && !hasProAccess;
                      return (
                        <li key={lesson._id}>
                          <Link
                            href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                            className="flex min-h-14 items-center gap-3 px-4 py-3 transition-colors duration-150 hover:bg-subtle"
                          >
                            {lesson.completed ? (
                              <CheckCircle2
                                className="h-5 w-5 shrink-0 text-sage"
                                aria-hidden="true"
                              />
                            ) : locked ? (
                              <Lock
                                className="h-5 w-5 shrink-0 p-0.5 text-mist"
                                aria-hidden="true"
                              />
                            ) : (
                              <PlayCircle
                                className="h-5 w-5 shrink-0 text-primary"
                                aria-hidden="true"
                              />
                            )}
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {lesson.title}
                                {lesson.completed && (
                                  <span className="sr-only"> (completed)</span>
                                )}
                                {locked && <span className="sr-only"> (Pro)</span>}
                              </span>
                              {lesson.summary && (
                                <span className="block truncate text-xs text-mist">
                                  {lesson.summary}
                                </span>
                              )}
                            </span>
                            {isPro && lesson.isFreePreview && (
                              <span className="chip hidden sm:inline-flex">
                                Free preview
                              </span>
                            )}
                            <span className="shrink-0 text-xs text-mist tabular-nums">
                              {formatDuration(lesson.durationSeconds)}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ol>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          {isAuthenticated && course.isEnrolled && course.totalLessons > 0 && (
            <div className="card p-5">
              <Progress value={progressPct}>
                <div className="flex items-baseline justify-between gap-2">
                  <ProgressLabel className="text-sm font-semibold">
                    Your progress
                  </ProgressLabel>
                  <ProgressValue className="text-sm font-semibold tabular-nums" />
                </div>
                <ProgressTrack className="mt-3 h-2 w-full overflow-hidden rounded-full bg-subtle">
                  <ProgressIndicator className="h-full rounded-full bg-sun" />
                </ProgressTrack>
              </Progress>
              <p className="mt-2 text-xs text-mist">
                {course.completedLessons} of {course.totalLessons} lessons done
              </p>
            </div>
          )}

          <div className="card p-5">
            <h2 className="text-sm font-semibold">What&apos;s included</h2>
            <ul className="mt-3 space-y-2 text-sm text-mist">
              <li>{plural(course.totalLessons, "video lesson")}</li>
              {videoMinutes > 0 && <li>{videoMinutes} minutes of video</li>}
              <li>A written guide with every lesson</li>
              {quizCount > 0 && (
                <li>
                  {quizCount} {quizCount === 1 ? "quiz" : "quizzes"} to check
                  what you learned
                </li>
              )}
              {isPro && freePreviewCount > 0 && (
                <li>{plural(freePreviewCount, "free preview lesson")}</li>
              )}
              <li>Progress saved to your account</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
