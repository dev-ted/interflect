"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
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
import { VukoraQuizCard } from "@/components/vukora/VukoraQuizCard";
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

export function VukoraWidget() {
  const { isAuthenticated } = useConvexAuth();
  const { has } = useAuth();
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
    isAuthenticated &&
      (has?.({ plan: PRO_PLAN_SLUG }) ||
        has?.({ feature: "vukora_ai" }) ||
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
      const response = await fetch("/api/vukora/chat", {
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
        throw new Error(data?.error ?? "Vukora could not respond right now.");
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
          : "Something went wrong talking to Vukora.",
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
          aria-label="Vukora AI Tutor"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          className="mb-3 flex h-[min(620px,calc(100vh-6rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border-2 border-[#18181B] bg-[#FFFBF2] shadow-[6px_6px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#0D0D12] dark:shadow-[6px_6px_0_0_#000000]"
        >
          <header className="flex items-center justify-between gap-3 border-b-2 border-[#18181B] bg-[#14141D] px-4 py-3 text-[#FAFAF5] dark:border-[#323244]">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 -rotate-3 shrink-0 items-center justify-center rounded-xl border-2 border-[#111116] bg-[#FFB800] text-[#111116] shadow-[2px_2px_0_0_#000000]">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-display truncate text-sm font-extrabold text-[#FAFAF5]">
                    Vukora AI Tutor
                  </h2>
                  <span className="inline-flex items-center gap-0.5 rounded-full border border-[#111116] bg-[#2563EB] px-2 py-0.5 text-[10px] font-extrabold text-white">
                    <Crown className="h-2.5 w-2.5 text-[#FFB800]" aria-hidden="true" />
                    PRO
                  </span>
                </div>
                <p className="truncate text-[11px] text-[#B4B4C6]">
                  Context-aware tutor &amp; quiz engine
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {hasProAccess && messages.length > 0 && (
                <Button
                  aria-label="Clear Vukora conversation"
                  onClick={handleReset}
                  className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[#B4B4C6] transition-colors hover:bg-[#1F1F2D] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB800]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              )}
              <Button
                aria-label="Close Vukora AI Tutor"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-[#B4B4C6] transition-colors hover:bg-[#1F1F2D] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB800]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </header>

          {!hasProAccess ? (
            <div className="flex flex-1 flex-col justify-between p-5">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-3 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
                  <Lock className="h-3 w-3" aria-hidden="true" />
                  Pro Exclusive Feature
                </div>

                <div>
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-[#111116] dark:text-[#FAFAF5]">
                    Study faster with your personal AI Tutor
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                    Vukora reads the exact lesson you are studying, tracks your
                    Convex progress, and generates interactive quizzes on demand.
                  </p>
                </div>

                <ul className="space-y-2.5 rounded-2xl border-2 border-[#18181B] bg-white p-4 text-xs text-[#111116] shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#E4E4EE] dark:shadow-[3px_3px_0_0_#000000]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#00B87C]"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Live lesson awareness:</strong> explains concepts
                      and code from the lesson you&apos;re currently viewing.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB] dark:text-[#60A5FA]"
                      aria-hidden="true"
                    />
                    <span>
                      <strong>Inline interactive quizzes:</strong> test your
                      knowledge with instant grading and explanations.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-[#D93817] dark:text-[#FF6B4A]"
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
                  className="tactile-btn inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A36] px-4 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  <Crown className="h-4 w-4" aria-hidden="true" />
                  Upgrade to Pro
                </Link>

                {!isAuthenticated && (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="tactile-btn-sm inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#111116] hover:bg-[#F6EFE0] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:bg-[#16161F] dark:text-[#FAFAF5] dark:hover:bg-[#1F1F2D]"
                    >
                      Already Pro? Sign In
                    </button>
                  </SignInButton>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 border-b-2 border-[#18181B]/15 bg-[#F6EFE0] px-4 py-2 dark:border-[#2A2A3B] dark:bg-[#16161F]">
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#18181B]/25 bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
                  {context.pageType === "lesson" ? (
                    <BookOpen className="h-3 w-3 shrink-0 text-[#D93817] dark:text-[#FF6B4A]" aria-hidden="true" />
                  ) : (
                    <Compass className="h-3 w-3 shrink-0 text-[#2563EB] dark:text-[#60A5FA]" aria-hidden="true" />
                  )}
                  <span className="truncate">Viewing: {viewingLabel}</span>
                </span>
              </div>

              <div
                aria-live="polite"
                className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
              >
                {messages.length === 0 ? (
                  <div className="space-y-4 pt-2">
                    <div className="rounded-2xl border-2 border-[#18181B] bg-white p-4 shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[3px_3px_0_0_#000000]">
                      <p className="font-display text-sm font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                        Hi{user?.firstName ? `, ${user.firstName}` : ""}! How can
                        I help you learn today?
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                        {context.pageType === "lesson" && context.lessonTitle
                          ? `I have full context on "${context.lessonTitle}" and your learning progress.`
                          : "I can inspect your live courses, check your progress, and build interactive quizzes."}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] font-extrabold tracking-wide text-[#52525B] uppercase dark:text-[#B4B4C6]">
                        Suggested for this page
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestionChips.map((chip) => (
                          <Button
                            key={chip}
                            disabled={loading}
                            onClick={() => void sendMessage(chip)}
                            className="tactile-btn-sm cursor-pointer rounded-xl bg-white px-3 py-1.5 text-left text-xs font-bold text-[#111116] hover:bg-[#FFB800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:bg-[#16161F] dark:text-[#FAFAF5] dark:hover:bg-[#FFB800] dark:hover:text-[#111116]"
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
                                  className="inline-flex items-center gap-1 rounded-md border border-[#18181B]/25 bg-[#F6EFE0] px-1.5 py-0.5 text-[10px] font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#E4E4EE]"
                                >
                                  <Wrench
                                    className="h-2.5 w-2.5 text-[#2563EB] dark:text-[#60A5FA]"
                                    aria-hidden="true"
                                  />
                                  {TOOL_LABELS[toolName] ?? toolName}
                                </span>
                              ))}
                            </div>
                          )}

                        <div
                          className={`max-w-[92%] rounded-2xl border-2 px-3.5 py-2.5 text-sm ${
                            isUser
                              ? "border-[#18181B] bg-[#2563EB] font-medium text-white shadow-[2px_2px_0_0_#111116]"
                              : "border-[#18181B]/20 bg-white text-[#111116] shadow-[2px_2px_0_0_rgba(17,17,22,0.12)] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#FAFAF5]"
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
                                <VukoraQuizCard
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
                  <div className="flex items-center gap-2 text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-[#FF5A36]"
                      aria-hidden="true"
                    />
                    <span>Vukora is thinking...</span>
                  </div>
                )}

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border-2 border-[#D93817] bg-[#FF5A36]/15 px-3 py-2 text-xs font-semibold text-[#111116] dark:text-[#FAFAF5]"
                  >
                    {error}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSubmit}
                className="border-t-2 border-[#18181B] bg-[#F6EFE0] p-3 dark:border-[#323244] dark:bg-[#16161F]"
              >
                <div className="flex items-end gap-2 rounded-2xl border-2 border-[#18181B] bg-white px-3 py-2 focus-within:border-[#2563EB] dark:border-[#3A3A52] dark:bg-[#0D0D12]">
                  <Textarea
                    ref={inputRef}
                    autoResize
                    rows={1}
                    aria-label="Message Vukora AI Tutor"
                    placeholder="Ask about this lesson or request a quiz..."
                    value={input}
                    onValueChange={setInput}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendMessage(input);
                      }
                    }}
                    className="max-h-28 min-h-[24px] flex-1 resize-none bg-transparent text-sm text-[#111116] placeholder:text-[#71717A] focus:outline-none dark:text-[#FAFAF5] dark:placeholder:text-[#8C8CA1]"
                  />
                  <Button
                    type="submit"
                    disabled={loading || input.trim().length === 0}
                    aria-label="Send message"
                    className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-[#18181B] bg-[#FF5A36] text-[#111116] transition-colors hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-disabled:cursor-not-allowed data-disabled:opacity-45"
                  >
                    <ArrowUp className="h-4 w-4 stroke-[2.5]" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </section>
      )}

      <Button
        aria-label="Open Vukora AI Tutor"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="tactile-btn group inline-flex h-13 cursor-pointer items-center gap-2 rounded-full bg-[#2563EB] px-5 text-sm font-extrabold text-white hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#111116] dark:focus-visible:outline-[#FFB800]"
      >
        {open ? (
          <X className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Sparkles className="h-5 w-5 text-[#FFB800]" aria-hidden="true" />
        )}
        <span>{open ? "Close Vukora" : "Ask Vukora"}</span>
      </Button>
    </div>
  );
}
