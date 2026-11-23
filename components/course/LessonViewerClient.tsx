"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Show, SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import {
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useMutation,
  useQuery,
} from "convex/react";
import { toast } from "@ui-sdk/react/toast";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Loader2,
  Lock,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useRefreshConvexAuth } from "@/components/ConvexClientProvider";
import { usePageContext } from "@/components/PageContextProvider";
import { isAdminRole, PRO_PLAN_ID, PRO_PLAN_SLUG } from "@/lib/auth";
import { MuxVideoPlayer } from "./MuxVideoPlayer";
import { LessonTranscript } from "./LessonTranscript";
import { MarkdownContent } from "./MarkdownContent";
import { LessonQuiz } from "./LessonQuiz";

export function LessonViewerClient() {
  const params = useParams<{ slug?: string; lessonSlug?: string }>();
  const courseSlug = typeof params.slug === "string" ? params.slug : "";
  const lessonSlug =
    typeof params.lessonSlug === "string" ? params.lessonSlug : "";

  const liveData = useQuery(
    api.courses.getLessonBySlug,
    courseSlug && lessonSlug ? { courseSlug, lessonSlug } : "skip",
  );

  // Retain the last loaded lesson within the same course while the next lesson
  // streams from Convex so the column never collapses to a short skeleton and
  // causes a vertical layout shift.
  const [retainedData, setRetainedData] = useState<typeof liveData>(undefined);
  if (liveData !== undefined && liveData !== retainedData) {
    setRetainedData(liveData);
  }

  const sameCourseRetained =
    retainedData && retainedData.course.slug === courseSlug
      ? retainedData
      : undefined;
  const data = liveData !== undefined ? liveData : sameCourseRetained;
  const isTransitioning =
    liveData === undefined && sameCourseRetained !== undefined;

  const videoRef = useRef<HTMLVideoElement>(null);
  const toggleComplete = useMutation(api.enrollments.toggleLessonComplete);
  const { isAuthenticated } = useConvexAuth();
  const { has } = useAuth();
  const { user } = useUser();
  const refreshConvexAuth = useRefreshConvexAuth();
  const { setPageDetail } = usePageContext();
  const [updatingComplete, setUpdatingComplete] = useState(false);
  const syncedLockedLessonRef = useRef<string | null>(null);

  const isAdmin = isAdminRole(user?.publicMetadata);
  const clientHasPro = Boolean(
    has?.({ plan: PRO_PLAN_SLUG }) ||
      has?.({ feature: "pro_courses" }) ||
      isAdmin,
  );

  // If Clerk's live client session already has Pro (e.g. right after an in-app
  // CheckoutButton upgrade without a full page refresh) while Convex still
  // reports the lesson as locked, force a fresh Clerk JWT into Convex right away.
  useEffect(() => {
    if (!liveData?.isLocked || !clientHasPro) {
      syncedLockedLessonRef.current = null;
      return;
    }
    const lessonKey = `${courseSlug}/${lessonSlug}`;
    if (syncedLockedLessonRef.current === lessonKey) return;
    syncedLockedLessonRef.current = lessonKey;
    void refreshConvexAuth();
  }, [
    liveData?.isLocked,
    clientHasPro,
    courseSlug,
    lessonSlug,
    refreshConvexAuth,
  ]);

  useEffect(() => {
    if (!liveData) return;
    setPageDetail({
      pageType: "lesson",
      pageTitle: liveData.lesson.title,
      courseSlug: liveData.course.slug,
      courseTitle: liveData.course.title,
      courseTier: liveData.course.tier,
      moduleTitle: liveData.module?.title,
      lessonSlug: liveData.lesson.slug,
      lessonTitle: liveData.lesson.title,
      lessonSummary: liveData.lesson.summary,
    });
  }, [liveData, setPageDetail]);

  // Initial load skeleton (geometry-matched to the real lesson layout to prevent CLS)
  if (data === undefined) {
    return (
      <div className="min-w-0">
        <div className="aspect-video w-full animate-pulse rounded-xl bg-subtle motion-reduce:animate-none" />
        <div className="mt-6 h-8 w-2/3 animate-pulse rounded-md bg-subtle motion-reduce:animate-none" />
        <div className="mt-3 h-4 w-5/6 animate-pulse rounded-md bg-subtle motion-reduce:animate-none" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold">Lesson not found</h1>
        <Link href={`/courses/${courseSlug}`} className="btn btn-primary mt-5">
          Back to course
        </Link>
      </div>
    );
  }

  async function handleToggleComplete() {
    if (!data || !isAuthenticated) return;
    setUpdatingComplete(true);
    try {
      const next = !data.isCompleted;
      await toggleComplete({
        courseId: data.course._id,
        lessonId: data.lesson._id,
        completed: next,
      });
      toast.success(next ? "Lesson marked complete." : "Lesson marked not complete.");
    } catch {
      toast.error("Sign in to save your progress.");
    } finally {
      setUpdatingComplete(false);
    }
  }

  const requiresPro =
    data.course.tier === "pro" && !data.lesson.isFreePreview;
  const lessonHref = (slug: string) => `/courses/${data.course.slug}/lessons/${slug}`;

  const paywallCard = (
    <div className="card px-6 py-12 text-center sm:px-10">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-subtle text-mist">
        <Lock className="h-5 w-5" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-bold">{data.lesson.title}</h1>
      <p className="mx-auto mt-2 max-w-md text-mist">
        This lesson is part of Interflect Pro. Pro opens every lesson, written
        guide and quiz, plus the AI tutor that knows what you&apos;re watching.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/pricing" className="btn btn-sun">
          See Pro
        </Link>
        <Authenticated>
          <CheckoutButton
            planId={PRO_PLAN_ID}
            planPeriod="annual"
            for="user"
            newSubscriptionRedirectUrl={`/courses/${courseSlug}/lessons/${lessonSlug}`}
            onSubscriptionComplete={() => {
              void refreshConvexAuth();
              toast.success("Welcome to Pro. Unlocking your lesson.");
            }}
          >
            <button type="button" className="btn btn-secondary">
              Upgrade now
            </button>
          </CheckoutButton>
        </Authenticated>
        <Unauthenticated>
          <SignInButton mode="modal">
            <button type="button" className="btn btn-secondary">
              Sign in
            </button>
          </SignInButton>
        </Unauthenticated>
      </div>
    </div>
  );

  const unlockedContent = data.isLocked ? (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-line bg-subtle p-8 text-center text-ink">
      <Loader2
        className="h-6 w-6 animate-spin text-sun motion-reduce:animate-none"
        aria-hidden="true"
      />
      <h2 className="mt-4 font-semibold">Unlocking your Pro lesson</h2>
      <p className="mt-1 text-sm text-mist">Syncing your subscription.</p>
    </div>
  ) : (
    <>
      <MuxVideoPlayer
        playbackId={data.lesson.muxPlaybackId}
        videoUrl={data.lesson.videoUrl}
        videoFileUrl={data.lesson.videoFileUrl}
        title={data.lesson.title}
        captions={data.lesson.transcript?.cues}
        ref={videoRef}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{data.lesson.title}</h1>
        {data.lesson.summary && (
          <p className="mt-2 max-w-[70ch] text-mist">{data.lesson.summary}</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-b border-line pb-6">
        <Authenticated>
          <button
            type="button"
            disabled={updatingComplete || isTransitioning}
            onClick={handleToggleComplete}
            aria-pressed={data.isCompleted}
            className={`btn ${data.isCompleted ? "btn-secondary text-sage" : "btn-primary"}`}
          >
            {data.isCompleted ? (
              <>
                <CheckCircle2
                  className="h-4 w-4 transition-[transform,opacity] duration-200 ease-(--ease-out) starting:scale-90 starting:opacity-0 motion-reduce:starting:scale-100"
                  aria-hidden="true"
                />
                Completed
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" aria-hidden="true" />
                Mark complete
              </>
            )}
          </button>
        </Authenticated>
        <Unauthenticated>
          <SignInButton mode="modal">
            <button type="button" className="btn btn-secondary">
              Sign in to track progress
            </button>
          </SignInButton>
        </Unauthenticated>
        {data.nextLesson && (
          <Link
            href={lessonHref(data.nextLesson.slug)}
            scroll={false}
            className="btn btn-ghost ml-auto"
          >
            Next lesson
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      {data.lesson.transcript && (
        <LessonTranscript
          key={data.lesson._id}
          paragraphs={data.lesson.transcript.paragraphs}
          videoRef={videoRef}
        />
      )}

      <section aria-labelledby="notes-heading" className="mt-8">
        <h2 id="notes-heading" className="sr-only">
          Lesson notes
        </h2>
        <MarkdownContent content={data.lesson.markdownContent} />
      </section>

      {data.lesson.quiz.length > 0 && (
        <section aria-labelledby="quiz-heading" className="mt-12 max-w-[70ch]">
          <h2 id="quiz-heading" className="text-xl font-bold">
            Check your understanding
          </h2>
          <p className="mt-1 text-sm text-mist">
            {data.lesson.quiz.length}{" "}
            {data.lesson.quiz.length === 1 ? "question" : "questions"}
          </p>
          <div className="mt-5">
            <LessonQuiz
              key={data.lesson._id}
              courseId={data.course._id}
              lessonId={data.lesson._id}
              questions={data.lesson.quiz}
              lastAttempt={data.lastQuizAttempt}
            />
          </div>
        </section>
      )}
    </>
  );

  return (
    <div
      aria-busy={isTransitioning}
      className={`min-w-0 transition-opacity duration-150 ${
        isTransitioning ? "opacity-70" : "opacity-100"
      }`}
    >
      {!requiresPro ? (
        unlockedContent
      ) : (
        <Show
          when={(checkHas) =>
            checkHas({ plan: PRO_PLAN_SLUG }) ||
            checkHas({ feature: "pro_courses" }) ||
            isAdmin
          }
          fallback={paywallCard}
        >
          {unlockedContent}
        </Show>
      )}

      <nav
        aria-label="Lesson navigation"
        className="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
      >
        {data.prevLesson ? (
          <Link
            href={lessonHref(data.prevLesson.slug)}
            scroll={false}
            className="flex min-w-0 items-center gap-3 rounded-xl border border-line p-4 transition-colors duration-150 hover:border-mist"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-mist" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-xs text-mist">Previous lesson</span>
              <span className="block truncate text-sm font-medium">
                {data.prevLesson.title}
              </span>
            </span>
          </Link>
        ) : (
          <div className="hidden sm:block" />
        )}
        {data.nextLesson && (
          <Link
            href={lessonHref(data.nextLesson.slug)}
            scroll={false}
            className="flex min-w-0 items-center justify-end gap-3 rounded-xl border border-line p-4 text-right transition-colors duration-150 hover:border-primary"
          >
            <span className="min-w-0">
              <span className="block text-xs text-primary">Next lesson</span>
              <span className="block truncate text-sm font-medium">
                {data.nextLesson.title}
              </span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          </Link>
        )}
      </nav>
    </div>
  );
}
