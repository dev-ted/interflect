"use client";

import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { toast } from "@ui-sdk/react/toast";
import { CheckCircle2, RotateCcw, Trophy, XCircle } from "lucide-react";
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
      <div className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No quiz questions have been added to this lesson yet.
      </div>
    );
  }

  const answeredCount = Object.keys(selections).length;
  const score = questions.reduce(
    (acc, q) => acc + (selections[q.id] === q.correctIndex ? 1 : 0),
    0,
  );

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
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
          <span className="inline-flex items-center gap-2 font-medium">
            <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            Previous attempt: {lastAttempt.score} / {lastAttempt.total} correct
          </span>
          <span className="text-xs opacity-80">Take it again anytime</span>
        </div>
      )}

      {submitted && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/40">
          <div>
            <p className="text-sm font-semibold text-indigo-950 dark:text-indigo-200">
              You scored {score} out of {questions.length} (
              {Math.round((score / questions.length) * 100)}%)
            </p>
            <p className="mt-0.5 text-xs text-indigo-700 dark:text-indigo-300">
              {score === questions.length
                ? "Perfect score! You nailed every concept in this lesson."
                : "Review the explanations below and retry whenever you're ready."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-300 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-50 dark:border-indigo-700 dark:bg-zinc-900 dark:text-indigo-300"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry Quiz
          </button>
        </div>
      )}

      {questions.map((q, qIdx) => {
        const chosen = selections[q.id];
        return (
          <fieldset
            key={q.id}
            className="rounded-2xl border border-zinc-200/90 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/60"
          >
            <legend className="text-sm font-semibold text-zinc-950 dark:text-white">
              <span className="mr-2 font-mono text-xs text-indigo-600 dark:text-indigo-400">
                Q{qIdx + 1}.
              </span>
              {q.question}
            </legend>

            <div className="mt-4 space-y-2.5">
              {q.options.map((opt, optIdx) => {
                const isSelected = chosen === optIdx;
                const isCorrect = optIdx === q.correctIndex;
                let style =
                  "border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-indigo-700";

                if (submitted) {
                  if (isCorrect) {
                    style =
                      "border-emerald-500 bg-emerald-50/90 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100";
                  } else if (isSelected && !isCorrect) {
                    style =
                      "border-rose-500 bg-rose-50/90 text-rose-950 dark:border-rose-600 dark:bg-rose-950/50 dark:text-rose-100";
                  } else {
                    style =
                      "border-zinc-200/60 opacity-65 dark:border-zinc-800/60";
                  }
                } else if (isSelected) {
                  style =
                    "border-indigo-600 bg-indigo-50/70 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-100";
                }

                return (
                  <button
                    key={`${q.id}-opt-${optIdx}`}
                    type="button"
                    disabled={submitted}
                    onClick={() =>
                      setSelections((prev) => ({ ...prev, [q.id]: optIdx }))
                    }
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${style}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current/25 font-mono text-xs font-semibold">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </span>

                    {submitted && isCorrect && (
                      <CheckCircle2
                        className="h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                    )}
                    {submitted && isSelected && !isCorrect && (
                      <XCircle
                        className="h-4.5 w-4.5 shrink-0 text-rose-600 dark:text-rose-400"
                        aria-hidden="true"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <p className="mt-4 rounded-xl bg-zinc-50 p-3.5 text-xs leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                <strong className="font-semibold text-zinc-950 dark:text-white">
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
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {answeredCount} of {questions.length} answered
          </span>
          <button
            type="button"
            disabled={saving || answeredCount < questions.length}
            onClick={handleSubmit}
            className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Check Answers"}
          </button>
        </div>
      )}
    </div>
  );
}
