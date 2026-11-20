"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { Button } from "@ui-sdk/react/button";
import { Textarea } from "@ui-sdk/react/textarea";
import {
  ArrowUp,
  BookOpen,
  CheckCircle2,
  Compass,
  Crown,
  Loader2,
  Lock,
  RotateCcw,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";
import { usePageContext } from "@/components/PageContextProvider";
import { MarkdownContent } from "@/components/course/MarkdownContent";
import { LearnlyQuizCard } from "@/components/learnly/LearnlyQuizCard";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";
import type { InteractiveQuizPayload, PageLearningContext } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quizzes?: InteractiveQuizPayload[];
  toolCalls?: string[];
}

const TOOL_LABELS: Record<string, string> = {
  list_courses: "Course Catalog",
  get_lesson_content: "Lesson Content",
  get_user_progress: "Your Progress",
  create_interactive_quiz: "Interactive Quiz",
};

function getSuggestionChips(context: PageLearningContext): string[] {
  if (context.pageType === "lesson") {
    return [
      "Summarize this lesson",
      "Quiz me on this lesson",
      "Explain the key concepts",
      "What should I learn next?",
    ];
  }
  if (context.pageType === "course") {
    return [
      "What will I learn in this course?",
      "Quiz me on this course",
      "Check my progress",
    ];
  }
  if (context.pageType === "dashboard") {
    return [
      "What should I study next?",
      "Summarize my learning progress",
      "Give me a quick practice quiz",
    ];
  }
  return [
    "Recommend a course for me",
    "Check my learning progress",
    "Give me a quick practice quiz",
  ];
}

export function LearnlyWidget() {
  const { isSignedIn, has } = useAuth();
  const { user } = useUser();
  const { context } = usePageContext();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messageIdRef = useRef(0);

  const hasProAccess = Boolean(
    isSignedIn &&
      (has?.({ plan: PRO_PLAN_SLUG }) ||
        has?.({ feature: "learnly_ai" }) ||
        has?.({ feature: "pro_courses" }) ||
        isAdminRole(user?.publicMetadata)),
  );

  const viewingLabel = context.lessonTitle ?? context.courseTitle ?? context.pageTitle;
  const suggestionChips = useMemo(() => getSuggestionChips(context), [context]);

  useEffect(() => {
    if (!open) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open || !hasProAccess) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, hasProAccess]);

  async function sendMessage(rawText: string) {
    const trimmed = rawText.trim();
    if (!trimmed || loading || !hasProAccess) return;

    messageIdRef.current += 1;
    const userMsg: ChatMessage = {
      id: `user-${messageIdRef.current}`,
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/learnly/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          pageContext: context,
        }),
      });

      const data = (await response.json().catch(() => null)) as {
        reply?: string;
        quizzes?: InteractiveQuizPayload[];
        toolCalls?: string[];
        error?: string;
      } | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Learnly could not respond right now.");
      }

      messageIdRef.current += 1;
      const assistantMsg: ChatMessage = {
        id: `assistant-${messageIdRef.current}`,
        role: "assistant",
        content:
          data?.reply ??
          "I'm ready to help — try asking about a lesson or requesting a quiz!",
        quizzes: Array.isArray(data?.quizzes) ? data.quizzes : [],
        toolCalls: Array.isArray(data?.toolCalls) ? data.toolCalls : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong talking to Learnly.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleReset() {
    setMessages([]);
    setError(null);
  }

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end">
      {open && (
        <section
          aria-label="Learnly AI Tutor"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="mb-3 flex h-[min(620px,calc(100vh-6rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-2xl shadow-zinc-950/15 ring-1 ring-zinc-950/5 dark:border-zinc-800 dark:bg-zinc-950 dark:shadow-black/50 dark:ring-white/10"
        >
          <header className="flex items-center justify-between gap-3 border-b border-zinc-200/80 bg-zinc-50/90 px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-900/90">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="truncate text-sm font-semibold text-zinc-950 dark:text-white">
                    Learnly AI Tutor
                  </h2>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    <Crown className="h-2.5 w-2.5" aria-hidden="true" />
                    PRO
                  </span>
                </div>
                <p className="truncate text-[11px] text-zinc-600 dark:text-zinc-400">
                  Context-aware tutor & quiz engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasProAccess && messages.length > 0 && (
                <Button
                  aria-label="Clear Learnly conversation"
                  onClick={handleReset}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              )}
              <Button
                aria-label="Close Learnly AI Tutor"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </header>

          {!hasProAccess ? (
            <div className="flex flex-1 flex-col justify-between p-5">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/80 dark:bg-indigo-950/70 dark:text-indigo-300">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Pro Exclusive Feature
                </div>

                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-white">
                    Study faster with your personal AI Tutor
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Learnly reads the exact lesson you are studying, tracks your
                    Convex progress, and generates interactive quizzes on demand.
                  </p>
                </div>

                <ul className="space-y-2.5 rounded-xl border border-zinc-200/80 bg-zinc-50/70 p-3.5 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/70 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Live lesson awareness:</strong> explains concepts
                      and code from the lesson you&apos;re currently viewing.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Inline interactive quizzes:</strong> test your
                      knowledge with instant grading and explanations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Personalized study roadmap:</strong> inspects your
                      completed lessons and tells you what to tackle next.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2.5 pt-4">
                <Link
                  href="/pricing"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <Crown className="h-4 w-4" aria-hidden="true" />
                  Upgrade to Pro
                </Link>

                {!isSignedIn && (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      Already Pro? Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b border-zinc-200/70 bg-white px-4 py-2 dark:border-zinc-800/80 dark:bg-zinc-950">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/70 px-2.5 py-0.5 text-[11px] font-medium text-indigo-800 dark:border-indigo-900/70 dark:bg-indigo-950/50 dark:text-indigo-200">
                  {context.pageType === "lesson" ? (
                    <BookOpen className="h-3 w-3 shrink-0" aria-hidden="true" />
                  ) : (
                    <Compass className="h-3 w-3 shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">Viewing: {viewingLabel}</span>
                </span>
              </div>

              <div
                aria-live="polite"
                className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
              >
                {messages.length === 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-4 dark:border-zinc-800 dark:bg-zinc-900/70">
                      <p className="text-sm font-semibold text-zinc-950 dark:text-white">
                        Hi{user?.firstName ? `, ${user.firstName}` : ""}! How can
                        I help you learn today?
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {context.pageType === "lesson" && context.lessonTitle
                          ? `I have full context on "${context.lessonTitle}" and your learning progress.`
                          : "I can inspect your live courses, check your progress, and build interactive quizzes."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-wide text-zinc-500 uppercase dark:text-zinc-400">
                        Suggested for this page
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestionChips.map((chip) => (
                          <Button
                            key={chip}
                            disabled={loading}
                            onClick={() => void sendMessage(chip)}
                            className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-zinc-800 transition-colors hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
                          >
                            {chip}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.role === "user";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isUser ? "items-end" : "items-start"
                        }`}
                      >
                        {!isUser &&
                          msg.toolCalls &&
                          msg.toolCalls.length > 0 && (
                            <div className="mb-1.5 flex flex-wrap gap-1">
                              {msg.toolCalls.map((toolName) => (
                                <span
                                  key={`${msg.id}-${toolName}`}
                                  className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
                                >
                                  <Wrench
                                    className="h-2.5 w-2.5 text-indigo-600 dark:text-indigo-400"
                                    aria-hidden="true"
                                  />
                                  {TOOL_LABELS[toolName] ?? toolName}
                                </span>
                              ))}
                            </div>
                          )}

                        <div
                          className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm ${
                            isUser
                              ? "bg-indigo-600 text-white"
                              : "border border-zinc-200/80 bg-zinc-50/90 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-100"
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {msg.content}
                            </p>
                          ) : (
                            <div className="[&_.lesson-prose]:text-[13px] [&_.lesson-prose]:leading-relaxed [&_.lesson-prose_h1]:text-base [&_.lesson-prose_h2]:mt-3 [&_.lesson-prose_h2]:text-sm [&_.lesson-prose_h3]:mt-2.5 [&_.lesson-prose_h3]:text-xs [&_.lesson-prose_p]:mb-2 [&_.lesson-prose_p:last-child]:mb-0 [&_.lesson-prose_ul]:mb-2 [&_.lesson-prose_ol]:mb-2">
                              <MarkdownContent content={msg.content} />
                            </div>
                          )}
                        </div>

                        {!isUser &&
                          msg.quizzes &&
                          msg.quizzes.length > 0 && (
                            <div className="w-full">
                              {msg.quizzes.map((quiz) => (
                                <LearnlyQuizCard
                                  key={`${msg.id}-${quiz.title}`}
                                  quiz={quiz}
                                />
                              ))}
                            </div>
                          )}
                      </div>
                    );
                  })
                )}

                {loading && (
                  <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400"
                      aria-hidden="true"
                    />
                    <span>Learnly is thinking...</span>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/70 dark:bg-rose-950/50 dark:text-rose-200"
                  >
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-900/80"
              >
                <div className="flex items-end gap-2 rounded-xl border border-zinc-300/90 bg-white px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950">
                  <Textarea
                    ref={inputRef}
                    autoResize
                    rows={1}
                    aria-label="Message Learnly AI Tutor"
                    placeholder="Ask about this lesson or request a quiz..."
                    value={input}
                    onValueChange={setInput}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(input);
                      }
                    }}
                    className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-zinc-950 placeholder:text-zinc-500 focus:outline-none dark:text-zinc-50 dark:placeholder:text-zinc-400"
                  />
                  <Button
                    type="submit"
                    disabled={loading || input.trim().length === 0}
                    aria-label="Send message"
                    className="inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-indigo-600 text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 data-disabled:cursor-not-allowed data-disabled:opacity-45"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </section>
      )}

      <Button
        aria-label="Open Learnly AI Tutor"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="group inline-flex h-13 cursor-pointer items-center gap-2 rounded-full bg-indigo-600 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-indigo-950/60 dark:hover:bg-indigo-400"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Sparkles className="h-5 w-5" aria-hidden="true" />
        )}
        <span>{open ? "Close Learnly" : "Ask Learnly"}</span>
      </Button>
    </div>
  );
}
