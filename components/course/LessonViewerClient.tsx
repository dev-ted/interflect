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
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { toast } from "@ui-sdk/react/toast";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Crown,
  HelpCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useRefreshConvexAuth } from "@/components/ConvexClientProvider";
import { usePageContext } from "@/components/PageContextProvider";
import { isAdminRole, PRO_PLAN_ID, PRO_PLAN_SLUG } from "@/lib/auth";
import { MuxVideoPlayer } from "./MuxVideoPlayer";
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

  // Initial load skeleton (geometry-matched to real lesson layout to prevent CLS)
  if (data === undefined) {
    return (
      <div className="min-w-0 space-y-6">
        <div className="aspect-video w-full animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
        <div className="space-y-2 border-b-2 border-[#E6DCC6] pb-6 dark:border-[#2A2A3B]">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-[#F6EFE0] dark:bg-[#16161F]" />
          <div className="h-4 w-5/6 animate-pulse rounded-md bg-[#F6EFE0] dark:bg-[#16161F]" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="tactile-card rounded-2xl px-6 py-16 text-center">
        <h1 className="text-2xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
          Lesson not found
        </h1>
        <Link
          href={`/courses/${courseSlug}`}
          className="tactile-btn mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Course
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
      toast.success(
        next ? "Lesson marked as complete!" : "Lesson marked as incomplete.",
      );
    } catch {
      toast.error("Please sign in to save your progress.");
    } finally {
      setUpdatingComplete(false);
    }
  }

  const requiresPro =
    data.course.tier === "pro" && !data.lesson.isFreePreview;

  const paywallCard = (
    <div className="relative flex aspect-video w-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-[#18181B] bg-[#14141D] p-6 text-center text-[#FAFAF5] shadow-[6px_6px_0_0_#2563EB] sm:p-8 dark:border-[#3A3A52]">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none absolute -top-6 -right-6 h-32 w-32 text-[#FFB800]/15"
      >
        <path
          fill="currentColor"
          d="M60 6l12 36 36 12-36 12-12 36-12-36-36-12 36-12z"
        />
      </svg>

      <span className="flex h-14 w-14 -rotate-3 items-center justify-center rounded-2xl border-2 border-[#111116] bg-[#FFB800] text-[#111116] shadow-[3px_3px_0_0_#000000]">
        <Lock className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="mt-4 inline-flex items-center gap-1 rounded-full border border-[#3B82F6] bg-[#2563EB] px-3 py-0.5 text-xs font-extrabold text-white">
        <Crown className="h-3.5 w-3.5 text-[#FFB800]" aria-hidden="true" />
        PRO LESSON
      </span>
      <h1 className="mt-3 text-xl font-extrabold sm:text-2xl">
        Unlock &ldquo;{data.lesson.title}&rdquo; with Pro
      </h1>
      <p className="mt-2 max-w-md text-sm text-[#D4D4E2]">
        Upgrade to Pro to unlock every lesson, rich markdown code guide,
        interactive quiz, and the context-aware Vukora AI tutor. Save 2 months
        free on Yearly!
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Authenticated>
          <CheckoutButton
            planId={PRO_PLAN_ID}
            planPeriod="annual"
            for="user"
            newSubscriptionRedirectUrl={`/courses/${courseSlug}/lessons/${lessonSlug}`}
            onSubscriptionComplete={() => {
              void refreshConvexAuth();
              toast.success("Welcome to Pro! Unlocking your lesson now...");
            }}
          >
            <button
              type="button"
              className="tactile-btn inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
            >
              <Crown className="h-4 w-4" aria-hidden="true" />
              Upgrade to Pro (2 Months Free)
            </button>
          </CheckoutButton>
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode="modal">
            <button
              type="button"
              className="tactile-btn inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
            >
              Sign In to Upgrade
            </button>
          </SignInButton>
        </Unauthenticated>

        <Link
          href="/pricing"
          className="inline-flex min-h-11 items-center rounded-xl border-2 border-[#4A4A62] bg-[#1F1F2D] px-4 py-2.5 text-sm font-bold text-[#FAFAF5] transition-colors hover:border-[#FFB800] hover:text-[#FFB800]"
        >
          Compare Plans
        </Link>
      </div>
    </div>
  );

  const unlockedContent = data.isLocked ? (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-2 border-[#18181B] bg-[#14141D] p-8 text-center text-[#FAFAF5] shadow-[6px_6px_0_0_#111116] dark:border-[#3A3A52]">
      <Loader2
        className="h-8 w-8 animate-spin text-[#FFB800]"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-lg font-extrabold">
        Unlocking your Pro lesson...
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-[#B4B4C6]">
        Syncing your active Pro subscription with Convex.
      </p>
    </div>
  ) : (
    <>
      <div className="relative">
        <MuxVideoPlayer
          playbackId={data.lesson.muxPlaybackId}
          title={data.lesson.title}
        />
        {isTransitioning && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-1.5 animate-pulse rounded-t-2xl bg-[#FF5A36]"
          />
        )}
      </div>

      {/* Lesson Title & Complete Action */}
      <div className="mt-6 flex flex-col justify-between gap-4 border-b-2 border-dashed border-[#E6DCC6] pb-6 sm:flex-row sm:items-start dark:border-[#2A2A3B]">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111116] sm:text-3xl dark:text-[#FAFAF5]">
            {data.lesson.title}
          </h1>
          <p className="mt-1.5 text-sm text-[#52525B] dark:text-[#B4B4C6]">
            {data.lesson.summary}
          </p>
        </div>

        <Authenticated>
          <button
            type="button"
            disabled={updatingComplete || isTransitioning}
            onClick={handleToggleComplete}
            className={`tactile-btn inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold disabled:opacity-50 ${
              data.isCompleted
                ? "bg-[#00B87C] text-[#111116] hover:bg-[#10D394]"
                : "bg-[#111116] text-[#FFFBF2] hover:bg-[#27272F] dark:bg-[#FAFAF5] dark:text-[#111116] dark:hover:bg-[#E4E4EE]"
            }`}
          >
            {data.isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Completed!
              </>
            ) : (
              <>
                <Circle className="h-4 w-4" aria-hidden="true" />
                Mark Complete
              </>
            )}
          </button>
        </Authenticated>

        <Unauthenticated>
          <SignInButton mode="modal">
            <button
              type="button"
              className="tactile-btn-sm inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#111116] hover:bg-[#F6EFE0] dark:bg-[#16161F] dark:text-[#FAFAF5]"
            >
              Sign in to track progress
            </button>
          </SignInButton>
        </Unauthenticated>
      </div>

      {/* Lesson Tabs: Markdown Notes + Interactive Quiz */}
      <Tabs key={data.lesson._id} defaultValue="notes" className="mt-6">
        <TabsList
          aria-label="Lesson content tabs"
          className="flex w-full gap-2 overflow-x-auto pb-1"
        >
          <TabsTab
            value="notes"
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border-2 border-[#18181B]/25 bg-white px-4 py-2 text-sm font-extrabold whitespace-nowrap text-[#52525B] transition-all hover:border-[#18181B] hover:text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-selected:border-[#18181B] data-selected:bg-[#FFB800] data-selected:text-[#111116] data-selected:shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6] dark:hover:text-[#FAFAF5] dark:data-selected:border-[#18181B] dark:data-selected:bg-[#FFB800] dark:data-selected:text-[#111116]"
          >
            <BookOpen className="h-4 w-4 shrink-0" aria-hidden="true" />
            Lesson Guide
          </TabsTab>
          <TabsTab
            value="quiz"
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border-2 border-[#18181B]/25 bg-white px-4 py-2 text-sm font-extrabold whitespace-nowrap text-[#52525B] transition-all hover:border-[#18181B] hover:text-[#111116] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-selected:border-[#18181B] data-selected:bg-[#FFB800] data-selected:text-[#111116] data-selected:shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6] dark:hover:text-[#FAFAF5] dark:data-selected:border-[#18181B] dark:data-selected:bg-[#FFB800] dark:data-selected:text-[#111116]"
          >
            <HelpCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Interactive Quiz
            {data.lesson.quiz.length > 0 && (
              <span className="rounded-full border border-[#18181B] bg-white px-2 py-0.5 font-mono text-xs font-extrabold text-[#111116]">
                {data.lesson.quiz.length}
              </span>
            )}
          </TabsTab>
        </TabsList>

        <TabsPanel value="notes" className="pt-5">
          <div className="tactile-card min-w-0 rounded-2xl p-6 sm:p-8">
            <MarkdownContent content={data.lesson.markdownContent} />
          </div>
        </TabsPanel>

        <TabsPanel value="quiz" className="pt-5">
          <LessonQuiz
            courseId={data.course._id}
            lessonId={data.lesson._id}
            questions={data.lesson.quiz}
            lastAttempt={data.lastQuizAttempt}
          />
        </TabsPanel>
      </Tabs>
    </>
  );

  return (
    <div
      aria-busy={isTransitioning}
      className={`min-w-0 transition-opacity duration-150 ${
        isTransitioning ? "opacity-80" : "opacity-100"
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

      {/* Previous / Next Navigation */}
      <div className="mt-8 flex items-center justify-between gap-4 border-t-2 border-dashed border-[#E6DCC6] pt-6 dark:border-[#2A2A3B]">
        {data.prevLesson ? (
          <Link
            href={`/courses/${data.course.slug}/lessons/${data.prevLesson.slug}`}
            scroll={false}
            className="tactile-btn-sm inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#111116] hover:bg-[#F6EFE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:bg-[#16161F] dark:text-[#FAFAF5] dark:hover:bg-[#1F1F2D]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="max-w-[180px] truncate">
              {data.prevLesson.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {data.nextLesson && (
          <Link
            href={`/courses/${data.course.slug}/lessons/${data.nextLesson.slug}`}
            scroll={false}
            className="tactile-btn inline-flex min-h-11 min-w-0 items-center gap-2 rounded-xl bg-[#FF5A36] px-4 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <span className="max-w-[180px] truncate">
              Next: {data.nextLesson.title}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
