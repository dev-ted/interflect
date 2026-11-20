"use client";

import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { toast } from "@ui-sdk/react/toast";
import { CheckCircle2, RotateCcw, Sparkles, Trophy, XCircle } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { QuizQuestion } from "@/lib/types";

interface LessonQuizProps {
  courseId: Id<"courses">;
  lessonId: Id<"lessons">;
  questions: QuizQuestion[];
  lastAttempt?: {
    score: number;
    total: number;
    answers: number[];
    completedAt: number;
  } | null;
}

export function LessonQuiz({
  courseId,
  lessonId,
  questions,
  lastAttempt,
}: LessonQuizProps) {
  const { isAuthenticated } = useConvexAuth();
  const recordAttempt = useMutation(api.enrollments.recordQuizAttempt);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-[#18181B]/35 bg-white p-8 text-center text-sm font-medium text-[#52525B] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6]">
        No quiz questions have been added to this lesson yet.
      </div>
    );
  }

  const answeredCount = Object.keys(selections).length;
  const score = questions.reduce(
    (acc, q) => acc + (selections[q.id] === q.correctIndex ? 1 : 0),
    0,
  );
  const isPerfect = score === questions.length;
  const isPassing = score >= Math.ceil(questions.length * 0.6);

  async function handleSubmit() {
    if (answeredCount < questions.length) {
      toast.error("Please select an answer for every question first.");
      return;
    }
    setSubmitted(true);
    if (isAuthenticated) {
      setSaving(true);
      try {
        await recordAttempt({
          courseId,
          lessonId,
          answers: questions.map((q) => selections[q.id] ?? -1),
          score,
          total: questions.length,
        });
        toast.success(`Quiz saved: ${score}/${questions.length} correct!`);
      } catch {
        toast.error("Could not save quiz attempt.");
      } finally {
        setSaving(false);
      }
    }
  }

  function handleReset() {
    setSelections({});
    setSubmitted(false);
  }

  return (
    <div className="space-y-6">
      {lastAttempt && !submitted && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#18181B] bg-[#00B87C]/20 px-4 py-3 text-sm text-[#111116] shadow-[3px_3px_0_0_#111116] dark:border-[#00B87C]/70 dark:bg-[#00B87C]/15 dark:text-[#FAFAF5] dark:shadow-[3px_3px_0_0_#000000]">
          <span className="inline-flex items-center gap-2 font-bold">
            <Trophy className="h-4 w-4 text-[#047857] dark:text-[#34D399]" aria-hidden="true" />
            Previous best: {lastAttempt.score} / {lastAttempt.total} correct
          </span>
          <span className="rounded-full border border-[#18181B]/25 bg-white px-2.5 py-0.5 text-xs font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#FAFAF5]">
            Take it again anytime
          </span>
        </div>
      )}

      {submitted && (
        <div
          className={`animate-pop-in relative overflow-hidden rounded-2xl border-2 border-[#18181B] p-5 shadow-[5px_5px_0_0_#111116] dark:border-[#3A3A52] dark:shadow-[5px_5px_0_0_#000000] ${
            isPerfect
              ? "bg-[#FFB800] text-[#111116]"
              : isPassing
                ? "bg-[#00B87C] text-[#111116]"
                : "bg-[#F6EFE0] text-[#111116] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]"
          }`}
        >
          {isPassing && (
            <svg
              aria-hidden="true"
              viewBox="0 0 120 80"
              className="pointer-events-none absolute top-1 right-28 hidden h-16 w-24 opacity-30 sm:block"
            >
              <circle cx="18" cy="18" r="6" fill="currentColor" />
              <path d="M55 8l5 15 15 5-15 5-5 15-5-15-15-5 15-5z" fill="currentColor" />
              <rect x="92" y="42" width="12" height="12" rx="3" transform="rotate(20 92 42)" fill="currentColor" />
            </svg>
          )}
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#18181B] bg-white text-[#111116] shadow-[2px_2px_0_0_#111116]">
                {isPerfect ? (
                  <Trophy className="h-5 w-5 text-[#D93817]" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-5 w-5 text-[#2563EB]" aria-hidden="true" />
                )}
              </span>
              <div>
                <p className="font-display text-base font-extrabold">
                  You scored {score} out of {questions.length} (
                  {Math.round((score / questions.length) * 100)}%)
                </p>
                <p className="mt-0.5 text-xs font-semibold opacity-90">
                  {isPerfect
                    ? "Perfect score! You nailed every single concept in this lesson."
                    : "Review the explanations below and retry whenever you're ready."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="tactile-btn-sm inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#111116] hover:bg-[#FFFBF2]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Retry Quiz
            </button>
          </div>
        </div>
      )}

      {questions.map((q, qIdx) => {
        const chosen = selections[q.id];
        return (
          <fieldset
            key={q.id}
            className="tactile-card rounded-2xl p-5 sm:p-6"
          >
            <legend className="font-display text-base font-extrabold text-[#111116] dark:text-[#FAFAF5]">
              <span className="mr-2 inline-flex rounded-md border border-[#18181B] bg-[#FFB800] px-1.5 py-0.5 font-mono text-xs font-extrabold text-[#111116]">
                Q{qIdx + 1}
              </span>
              {q.question}
            </legend>

            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, optIdx) => {
                const isSelected = chosen === optIdx;
                const isCorrect = optIdx === q.correctIndex;
                let style =
                  "border-2 border-[#18181B]/20 bg-[#FFFBF2] text-[#111116] hover:border-[#18181B] hover:bg-white dark:border-[#3A3A52] dark:bg-[#12121A] dark:text-[#FAFAF5] dark:hover:border-[#FFB800]";

                if (submitted) {
                  if (isCorrect) {
                    style =
                      "border-2 border-[#047857] bg-[#00B87C]/20 text-[#111116] shadow-[2px_2px_0_0_#047857] dark:border-[#34D399] dark:bg-[#00B87C]/20 dark:text-[#FAFAF5]";
                  } else if (isSelected && !isCorrect) {
                    style =
                      "border-2 border-[#D93817] bg-[#FF5A36]/20 text-[#111116] dark:border-[#FF6B4A] dark:bg-[#FF5A36]/20 dark:text-[#FAFAF5]";
                  } else {
                    style =
                      "border-2 border-[#18181B]/10 opacity-60 dark:border-[#2A2A3B]";
                  }
                } else if (isSelected) {
                  style =
                    "border-2 border-[#18181B] bg-[#FFB800] text-[#111116] shadow-[3px_3px_0_0_#111116] dark:border-[#18181B] dark:bg-[#FFB800] dark:text-[#111116]";
                }

                return (
                  <button
                    key={`${q.id}-opt-${optIdx}`}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelections((prev) => ({ ...prev, [q.id]: optIdx }))
                    }
                    className={`flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all disabled:cursor-default ${style}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-lg border-2 border-current/30 bg-white/80 font-mono text-xs font-extrabold text-[#111116] dark:bg-[#16161F]/80 dark:text-[#FAFAF5]">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </span>

                    {submitted && isCorrect && (
                      <CheckCircle2
                        className="h-5 w-5 shrink-0 text-[#047857] dark:text-[#34D399]"
                        aria-hidden="true"
                      />
                    )}
                    {submitted && isSelected && !isCorrect && (
                      <XCircle
                        className="h-5 w-5 shrink-0 text-[#D93817] dark:text-[#FF6B4A]"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <p className="mt-4 rounded-xl border-2 border-dashed border-[#18181B]/25 bg-[#F6EFE0] p-3.5 text-xs leading-relaxed text-[#111116] dark:border-[#3A3A52] dark:bg-[#12121A] dark:text-[#D4D4E2]">
                <strong className="font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                  Explanation:{" "}
                </strong>
                {q.explanation}
              </p>
            )}
          </fieldset>
        );
      })}

      {!submitted && (
        <div className="flex items-center justify-between pt-2">
          <span className="rounded-lg border border-[#18181B]/20 bg-[#F6EFE0] px-3 py-1 font-mono text-xs font-bold text-[#52525B] dark:border-[#3A3A52] dark:bg-[#16161F] dark:text-[#B4B4C6]">
            {answeredCount} of {questions.length} answered
          </span>
          <button
            type="button"
            disabled={saving || answeredCount < questions.length}
            onClick={handleSubmit}
            className="tactile-btn min-h-11 cursor-pointer rounded-xl bg-[#FF5A36] px-6 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Check Answers"}
          </button>
        </div>
      )}
    </div>
  );
}
