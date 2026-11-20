"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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

export function LessonViewerClient({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const data = useQuery(api.courses.getLessonBySlug, {
    courseSlug,
    lessonSlug,
  });
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
    if (!data?.isLocked || !clientHasPro) {
      syncedLockedLessonRef.current = null;
      return;
    }
    const lessonKey = `${courseSlug}/${lessonSlug}`;
    if (syncedLockedLessonRef.current === lessonKey) return;
    syncedLockedLessonRef.current = lessonKey;
    void refreshConvexAuth();
  }, [data?.isLocked, clientHasPro, courseSlug, lessonSlug, refreshConvexAuth]);

  useEffect(() => {
    if (!data) return;
    setPageDetail({
      pageType: "lesson",
      pageTitle: data.lesson.title,
      courseSlug: data.course.slug,
      courseTitle: data.course.title,
      courseTier: data.course.tier,
      moduleTitle: data.module?.title,
      lessonSlug: data.lesson.slug,
      lessonTitle: data.lesson.title,
      lessonSummary: data.lesson.summary,
    });
  }, [data, setPageDetail]);

  // Only the left lesson pane shows a lightweight skeleton while loading;
  // the Course Outline sidebar in `lessons/layout.tsx` stays mounted & untouched.
  if (data === undefined) {
    return (
      <div className="space-y-6">
        <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-16 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        <div className="h-56 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="rounded-2xl border border-zinc-200/80 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-white">
          Lesson not found
        </h1>
        <Link
          href={`/courses/${courseSlug}`}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white dark:bg-white dark:text-zinc-950"
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
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-zinc-950 via-indigo-950 to-zinc-950 p-8 text-center text-white shadow-xl dark:border-indigo-900/60">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-300">
        <Lock className="h-7 w-7" aria-hidden="true" />
      </span>
      <span className="mt-4 inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-200">
        <Crown className="h-3.5 w-3.5" aria-hidden="true" />
        Pro Lesson
      </span>
      <h1 className="mt-3 text-xl font-bold sm:text-2xl">
        Unlock &ldquo;{data.lesson.title}&rdquo; with Pro
      </h1>
      <p className="mt-2 max-w-md text-sm text-zinc-300">
        Upgrade to Pro to unlock every lesson, rich markdown code guide,
        interactive quiz, and the context-aware Learnly AI tutor. Save 2 months
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
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
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              Sign In to Upgrade
            </button>
          </SignInButton>
        </Unauthenticated>

        <Link
          href="/pricing"
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
        >
          Compare Plans
        </Link>
      </div>
    </div>
  );

  const unlockedContent = data.isLocked ? (
    <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-indigo-200/80 bg-zinc-950 p-8 text-center text-white shadow-xl dark:border-indigo-900/60">
      <Loader2
        className="h-8 w-8 animate-spin text-indigo-400"
        aria-hidden="true"
      />
      <h2 className="mt-4 text-lg font-semibold">
        Unlocking your Pro lesson...
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-zinc-400">
        Syncing your active Pro subscription with Convex.
      </p>
    </div>
  ) : (
    <>
      <MuxVideoPlayer
        playbackId={data.lesson.muxPlaybackId}
        title={data.lesson.title}
      />

      {/* Lesson Title & Complete Action */}
      <div className="mt-6 flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 sm:flex-row sm:items-start dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
            {data.lesson.title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            {data.lesson.summary}
          </p>
        </div>

        <Authenticated>
          <button
            type="button"
            disabled={updatingComplete}
            onClick={handleToggleComplete}
            className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
              data.isCompleted
                ? "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            }`}
          >
            {data.isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Completed
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
              className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
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
          className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800"
        >
          <TabsTab
            value="notes"
            className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 data-selected:border-indigo-600 data-selected:text-indigo-600 dark:text-zinc-400 dark:hover:text-white dark:data-selected:border-indigo-400 dark:data-selected:text-indigo-400"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Lesson Guide
          </TabsTab>
          <TabsTab
            value="quiz"
            className="inline-flex cursor-pointer items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-900 data-selected:border-indigo-600 data-selected:text-indigo-600 dark:text-zinc-400 dark:hover:text-white dark:data-selected:border-indigo-400 dark:data-selected:text-indigo-400"
          >
            <HelpCircle className="h-4 w-4" aria-hidden="true" />
            Interactive Quiz
            {data.lesson.quiz.length > 0 && (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {data.lesson.quiz.length}
              </span>
            )}
          </TabsTab>
        </TabsList>

        <TabsPanel value="notes" className="pt-6">
          <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900/50">
            <MarkdownContent content={data.lesson.markdownContent} />
          </div>
        </TabsPanel>

        <TabsPanel value="quiz" className="pt-6">
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
    <div>
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
      <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-200/80 pt-6 dark:border-zinc-800">
        {data.prevLesson ? (
          <Link
            href={`/courses/${data.course.slug}/lessons/${data.prevLesson.slug}`}
            scroll={false}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
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
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            <span className="max-w-[180px] truncate">
              Next: {data.nextLesson.title}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
