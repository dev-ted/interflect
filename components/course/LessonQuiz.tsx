"use client";

import { useState } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
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

// Revealed content eases in when the learner checks their answers.
const REVEAL =
  "transition-[opacity,transform] duration-300 ease-(--ease-out) starting:translate-y-1 starting:opacity-0 motion-reduce:starting:translate-y-0";

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
      <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-mist">
        This lesson has no quiz yet.
      </p>
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
      toast.error("Answer every question first.");
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
        });
      } catch {
        toast.error("Could not save your quiz result.");
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
    <div className="space-y-8">
      {lastAttempt && !submitted && (
        <p className="text-sm text-mist">
          Your last result: {lastAttempt.score} of {lastAttempt.total} correct.
        </p>
      )}

      {questions.map((q, qIdx) => {
        const chosen = selections[q.id];
        const gotIt = chosen === q.correctIndex;
        const labelId = `quiz-${q.id}`;
        return (
          <div key={q.id}>
            <p id={labelId} className="font-semibold">
              <span className="mr-2 text-mist tabular-nums">{qIdx + 1}.</span>
              {q.question}
            </p>

            <RadioGroup
              aria-labelledby={labelId}
              readOnly={submitted}
              value={chosen === undefined ? null : String(chosen)}
              onValueChange={(val) => {
                if (val !== null) setSelections((prev) => ({ ...prev, [q.id]: Number(val) }));
              }}
              className="mt-3 space-y-2"
            >
              {q.options.map((opt, optIdx) => {
                const isCorrect = optIdx === q.correctIndex;
                const isSelected = chosen === optIdx;
                const state = !submitted
                  ? "border-line bg-surface hover:border-mist data-checked:border-primary data-checked:bg-primary/5"
                  : isCorrect
                    ? "border-sage bg-sage/10"
                    : isSelected
                      ? "border-danger bg-danger/10"
                      : "border-line bg-surface text-mist";
                return (
                  <Radio
                    key={optIdx}
                    value={String(optIdx)}
                    className={`flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-left text-sm transition-colors duration-150 data-readonly:cursor-default ${state}`}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-mist in-data-checked:border-primary">
                      <RadioIndicator className="h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && isCorrect && (
                      <CheckCircle2 className={`h-5 w-5 shrink-0 text-sage ${REVEAL}`} aria-label="Correct answer" />
                    )}
                    {submitted && isSelected && !isCorrect && (
                      <XCircle className={`h-5 w-5 shrink-0 text-danger ${REVEAL}`} aria-label="Your answer, incorrect" />
                    )}
                  </Radio>
                );
              })}
            </RadioGroup>

            {submitted && (
              <p className={`mt-3 rounded-md bg-subtle p-3 text-sm leading-relaxed ${REVEAL}`}>
                <strong className={gotIt ? "text-sage" : "text-danger"}>
                  {gotIt ? "Correct. " : "Not quite. "}
                </strong>
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}

      {submitted ? (
        <div role="status" className={`card flex flex-wrap items-center justify-between gap-4 p-5 ${REVEAL}`}>
          <div className="flex items-center gap-3">
            {isPerfect ? (
              <Trophy className="h-6 w-6 shrink-0 text-sun" aria-hidden="true" />
            ) : isPassing ? (
              <CheckCircle2 className="h-6 w-6 shrink-0 text-sage" aria-hidden="true" />
            ) : null}
            <div>
              <p className="font-semibold">
                You got {score} of {questions.length} right
              </p>
              <p className="text-sm text-mist">
                {isPerfect
                  ? "Every answer correct."
                  : "Read the explanations, then try again when you're ready."}
                {saving && " Saving…"}
              </p>
            </div>
          </div>
          <button type="button" onClick={handleReset} className="btn btn-secondary">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-mist">
            {answeredCount} of {questions.length} answered
          </span>
          <button
            type="button"
            disabled={saving || answeredCount < questions.length}
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            Check answers
          </button>
        </div>
      )}
    </div>
  );
}
