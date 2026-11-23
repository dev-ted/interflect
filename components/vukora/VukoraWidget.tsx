"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { SignInButton, useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth } from "convex/react";
import { Button } from "@ui-sdk/react/button";
import { Textarea } from "@ui-sdk/react/textarea";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@ui-sdk/react/popover";
import { ArrowUp, Loader2, RotateCcw, X } from "lucide-react";
import { LogoMark } from "@/components/brand/Logo";
import { usePageContext } from "@/components/PageContextProvider";
import { MarkdownContent } from "@/components/course/MarkdownContent";
import { VukoraQuizCard } from "@/components/vukora/VukoraQuizCard";
import { isAdminRole, PRO_PLAN_SLUG } from "@/lib/auth";
import { PRO_ENABLED } from "@/convex/lib/features";
import type { InteractiveQuizPayload, PageLearningContext } from "@/lib/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  quizzes?: InteractiveQuizPayload[];
  toolCalls?: string[];
}

const TOOL_LABELS: Record<string, string> = {
  list_courses: "Course catalog",
  get_lesson_content: "Lesson content",
  get_user_progress: "Your progress",
  create_interactive_quiz: "Quiz",
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
      (!PRO_ENABLED ||
        has?.({ plan: PRO_PLAN_SLUG }) ||
        has?.({ feature: "vukora_ai" }) ||
        has?.({ feature: "pro_courses" }) ||
        isAdminRole(user?.publicMetadata)),
  );

  const viewingLabel = context.lessonTitle ?? context.courseTitle ?? context.pageTitle;
  const suggestionChips = useMemo(() => getSuggestionChips(context), [context]);

  useEffect(() => {
    if (!open) return;
    // Scroll only the message list; scrollIntoView would also scroll the panel and hide its header.
    const list = messagesEndRef.current?.parentElement;
    list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
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
        throw new Error(data?.error ?? "The Interflect tutor could not respond. Try again.");
      }

      messageIdRef.current += 1;
      const assistantMsg: ChatMessage = {
        id: `assistant-${messageIdRef.current}`,
        role: "assistant",
        content:
          data?.reply ??
          "I'm ready to help. Ask about a lesson or request a quiz.",
        quizzes: Array.isArray(data?.quizzes) ? data.quizzes : [],
        toolCalls: Array.isArray(data?.toolCalls) ? data.toolCalls : [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Try again.",
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
    <Popover
      open={open}
      modal={false}
      onOpenChange={(next, details) => {
        // Stay open while the learner reads or clicks around the lesson.
        if (!next && (details.reason === "outside-press" || details.reason === "focus-out")) {
          return details.cancel();
        }
        setOpen(next);
      }}
    >
      <PopoverTrigger
        aria-label={open ? "Close Interflect tutor" : "Open Interflect tutor"}
        className="btn btn-secondary fixed right-5 bottom-5 z-50 h-12 w-12 rounded-full p-0 shadow-card"
      >
        <LogoMark className="h-6 w-6" />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        collisionPadding={16}
        className="card m-0 flex h-[min(600px,calc(100dvh-6rem))] w-[min(400px,calc(100vw-2rem))] origin-(--transform-origin) flex-col overflow-hidden p-0 text-ink transition-[opacity,scale] duration-200 ease-(--ease-out) data-starting-style:scale-95 data-starting-style:opacity-0 data-ending-style:scale-95 data-ending-style:opacity-0 data-ending-style:duration-150 motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100"
      >
        <header className="flex items-center gap-3 border-b border-line px-4 py-3">
          <LogoMark className="h-6 w-6 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <PopoverTitle className="text-sm font-bold">Interflect tutor</PopoverTitle>
              {PRO_ENABLED && <span className="chip h-5 px-2">Pro</span>}
            </div>
            <p className="truncate text-xs text-mist">Viewing {viewingLabel}</p>
          </div>
          {hasProAccess && messages.length > 0 && (
            <Button
              aria-label="Clear conversation"
              onClick={handleReset}
              className="btn btn-ghost btn-icon btn-sm w-8 text-mist"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </Button>
          )}
          <PopoverClose aria-label="Close Interflect tutor" className="btn btn-ghost btn-icon btn-sm w-8 text-mist">
            <X className="h-4 w-4" aria-hidden="true" />
          </PopoverClose>
        </header>

        {!hasProAccess ? (
          <div className="flex flex-1 flex-col gap-4 p-5">
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                {isAuthenticated ? "The tutor is part of Pro" : "Sign in to use the tutor"}
              </h3>
              <p className="text-sm leading-relaxed text-mist">
                The Interflect tutor reads the lesson you are on, explains concepts and
                code, checks your progress and builds quick quizzes.
                {PRO_ENABLED ? " It comes with the Pro plan." : " It’s free with an account."}
              </p>
            </div>
            <div className="mt-auto space-y-2">
              {PRO_ENABLED && (
                <Link href="/pricing" onClick={() => setOpen(false)} className="btn btn-sun w-full">
                  See Pro plans
                </Link>
              )}
              {!isAuthenticated && (
                <SignInButton mode="modal">
                  <button type="button" onClick={() => setOpen(false)} className={`btn w-full ${PRO_ENABLED ? "btn-secondary" : "btn-primary"}`}>
                    Sign in
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        ) : (
          <>
            <div
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto overscroll-contain p-4"
            >
              {messages.length === 0 ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">
                      Hi{user?.firstName ? ` ${user.firstName}` : ""}, what would you like to learn?
                    </p>
                    <p className="text-sm text-mist">
                      {context.pageType === "lesson" && context.lessonTitle
                        ? `I can see "${context.lessonTitle}" and your progress.`
                        : "I can look through your courses, check your progress and build quizzes."}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-mist">Try asking</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestionChips.map((chip) => (
                        <Button
                          key={chip}
                          disabled={loading}
                          onClick={() => void sendMessage(chip)}
                          className="chip h-8 cursor-pointer px-3 text-left text-ink transition-colors hover:bg-line"
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
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mb-1.5 flex flex-wrap gap-1">
                          {msg.toolCalls.map((toolName) => (
                            <span key={`${msg.id}-${toolName}`} className="chip h-5 px-2 text-[11px]">
                              {TOOL_LABELS[toolName] ?? toolName}
                            </span>
                          ))}
                        </div>
                      )}

                      {isUser ? (
                        <p className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap text-on-primary">
                          {msg.content}
                        </p>
                      ) : (
                        <div className="w-full [&_.lesson-prose]:text-sm [&_.lesson-prose]:leading-relaxed [&_.lesson-prose_h1]:text-base [&_.lesson-prose_h2]:mt-3 [&_.lesson-prose_h2]:text-sm [&_.lesson-prose_h3]:mt-2.5 [&_.lesson-prose_h3]:text-sm [&_.lesson-prose_p]:mb-2 [&_.lesson-prose_p:last-child]:mb-0 [&_.lesson-prose_ul]:mb-2 [&_.lesson-prose_ol]:mb-2">
                          <MarkdownContent content={msg.content} />
                        </div>
                      )}

                      {!isUser &&
                        msg.quizzes?.map((quiz) => (
                          <VukoraQuizCard key={`${msg.id}-${quiz.title}`} quiz={quiz} />
                        ))}
                    </div>
                  );
                })
              )}

              {loading && (
                <p className="flex items-center gap-2 text-sm text-mist">
                  <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Thinking
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-danger/30 px-3 py-2 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-line p-3">
              <Textarea
                ref={inputRef}
                autoResize
                rows={1}
                aria-label="Message the Interflect tutor"
                placeholder="Ask about this lesson or request a quiz"
                value={input}
                onValueChange={setInput}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage(input);
                  }
                }}
                className="field max-h-28 flex-1 resize-none"
              />
              <Button
                type="submit"
                disabled={loading || input.trim().length === 0}
                aria-label="Send message"
                className="btn btn-primary btn-icon shrink-0"
              >
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </Button>
            </form>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
