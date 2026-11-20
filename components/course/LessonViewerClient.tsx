"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Show, SignInButton, useAuth } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { useMutation, useQuery } from "convex/react";
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
  Lock,
  PlayCircle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { usePageContext } from "@/components/PageContextProvider";
import { PRO_PLAN_ID } from "@/lib/auth";
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
  const { isSignedIn } = useAuth();
  const { setPageDetail } = usePageContext();
  const [updatingComplete, setUpdatingComplete] = useState(false);

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

  if (data === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-8 dark:bg-zinc-900" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-4 dark:bg-zinc-900" />
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
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
    if (!data) return;
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

  const progressPct =
    data.totalLessons > 0
      ? Math.round((data.completedCount / data.totalLessons) * 100)
      : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb bar */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <Link
            href={`/courses/${data.course.slug}`}
            className="inline-flex items-center gap-1.5 font-medium text-zinc-700 transition-colors hover:text-indigo-600 dark:text-zinc-300 dark:hover:text-indigo-400"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {data.course.title}
          </Link>
          {data.module && (
            <>
              <span>/</span>
              <span className="truncate">{data.module.title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {data.course.tier === "pro" && data.lesson.isFreePreview && (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
              Free Preview
            </span>
          )}
          <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
            {data.completedCount}/{data.totalLessons} completed ({progressPct}%)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        {/* Main Lesson Column */}
        <div className="lg:col-span-8">
          {data.isLocked ? (
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
                interactive quiz, and the context-aware Learnly AI tutor. Save 2
                months free on Yearly!
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Show when="signed-in">
                  <CheckoutButton
                    planId={PRO_PLAN_ID}
                    planPeriod="annual"
                    for="user"
                    newSubscriptionRedirectUrl={`/courses/${courseSlug}/lessons/${lessonSlug}`}
                  >
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      <Crown className="h-4 w-4" aria-hidden="true" />
                      Upgrade to Pro (2 Months Free)
                    </button>
                  </CheckoutButton>
                </Show>

                <Show when="signed-out">
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      Sign In to Upgrade
                    </button>
                  </SignInButton>
                </Show>

                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15"
                >
                  Compare Plans
                </Link>
              </div>
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

                {isSignedIn ? (
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
                ) : (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      Sign in to track progress
                    </button>
                  </SignInButton>
                )}
              </div>

              {/* Lesson Tabs: Markdown Notes + Interactive Quiz */}
              <Tabs defaultValue="notes" className="mt-6">
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
          )}

          {/* Previous / Next Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-zinc-200/80 pt-6 dark:border-zinc-800">
            {data.prevLesson ? (
              <Link
                href={`/courses/${data.course.slug}/lessons/${data.prevLesson.slug}`}
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

        {/* Curriculum Sidebar */}
        <aside className="sticky top-22 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white lg:col-span-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="border-b border-zinc-200/80 px-5 py-4 dark:border-zinc-800">
            <h2 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Course Outline
            </h2>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="max-h-[70vh] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {data.curriculum.map((mod) => (
              <div key={mod._id} className="p-4">
                <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                  {mod.title}
                </p>
                <ul className="mt-2 space-y-1">
                  {mod.lessons.map((item) => {
                    const isActive = item.slug === data.lesson.slug;
                    return (
                      <li key={item._id}>
                        <Link
                          href={`/courses/${data.course.slug}/lessons/${item.slug}`}
                          aria-current={isActive ? "page" : undefined}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300"
                              : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/60"
                          }`}
                        >
                          {item.completed ? (
                            <CheckCircle2
                              className="h-4 w-4 shrink-0 text-emerald-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <PlayCircle
                              className="h-4 w-4 shrink-0 text-zinc-400"
                              aria-hidden="true"
                            />
                          )}
                          <span className="flex-1 truncate">{item.title}</span>
                          {data.course.tier === "pro" && item.isFreePreview && (
                            <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                              Free
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
