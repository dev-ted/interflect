"use client";

import { useId, useState } from "react";
import { Button } from "@ui-sdk/react/button";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { InteractiveQuizPayload } from "@/lib/types";

interface VukoraQuizCardProps {
  quiz: InteractiveQuizPayload;
}

export function VukoraQuizCard({ quiz }: VukoraQuizCardProps) {
  const baseId = useId();
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const total = quiz.questions.length;
  const answeredCount = Object.keys(selections).length;
  const score = quiz.questions.reduce(
    (acc, q) => acc + (selections[q.id] === q.correctIndex ? 1 : 0),
    0,
  );
  const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0;

  function handleCheckAnswers() {
    if (answeredCount < total) return;
    setSubmitted(true);
  }

  function handleRetry() {
    setSelections({});
    setSubmitted(false);
  }

  return (
    <div className="mt-3 w-full overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="text-xs text-mist">Quiz</p>
          <h4 className="truncate text-sm font-semibold">{quiz.title}</h4>
        </div>
        <span className="chip shrink-0 tabular-nums">
          {submitted ? `${score} of ${total} correct` : `${answeredCount} of ${total} answered`}
        </span>
      </div>

      {submitted && (
        <div className="flex items-center justify-between gap-2 border-b border-line bg-subtle px-3.5 py-2.5">
          <p className={`text-sm font-semibold ${score === total ? "text-sage" : "text-ink"}`}>
            You scored {score} out of {total} ({scorePercent}%)
          </p>
          <Button onClick={handleRetry} className="btn btn-secondary btn-sm">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </Button>
        </div>
      )}

      <div className="divide-y divide-line">
        {quiz.questions.map((question, qIdx) => {
          const chosen = selections[question.id];
          const groupLabelId = `${baseId}-q-${question.id}`;

          return (
            <div key={question.id} className="p-3.5">
              <p id={groupLabelId} className="text-sm leading-relaxed font-semibold">
                <span className="mr-1.5 text-mist">{qIdx + 1}.</span>
                {question.question}
              </p>

              <RadioGroup
                aria-labelledby={groupLabelId}
                readOnly={submitted}
                value={chosen !== undefined ? String(chosen) : null}
                onValueChange={(nextValue) => {
                  if (submitted || nextValue === null) return;
                  setSelections((prev) => ({
                    ...prev,
                    [question.id]: Number(nextValue),
                  }));
                }}
                className="mt-2.5 space-y-1.5"
              >
                {question.options.map((option, optIdx) => {
                  const isSelected = chosen === optIdx;
                  const isCorrect = optIdx === question.correctIndex;
                  const optionValue = String(optIdx);

                  let rowClasses = "border-line hover:border-mist";
                  if (submitted) {
                    rowClasses = isCorrect
                      ? "border-sage bg-sage/10"
                      : isSelected
                        ? "border-danger bg-danger/10"
                        : "border-line text-mist";
                  } else if (isSelected) {
                    rowClasses = "border-primary bg-primary/10";
                  }

                  return (
                    <label
                      key={`${question.id}-${optionValue}`}
                      className={`flex items-start gap-2.5 rounded-md border px-2.5 py-2 text-sm transition-colors ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      } ${rowClasses}`}
                    >
                      <Radio
                        value={optionValue}
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-mist bg-surface data-checked:border-primary"
                      >
                        <RadioIndicator className="h-2 w-2 rounded-full bg-primary" />
                      </Radio>

                      <span className="flex-1 leading-snug">{option}</span>

                      {submitted && isCorrect && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-label="Correct answer" />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-label="Your answer, incorrect" />
                      )}
                    </label>
                  );
                })}
              </RadioGroup>

              {submitted && (
                <p className="mt-2.5 text-sm leading-relaxed text-mist">
                  <span className={`font-semibold ${chosen === question.correctIndex ? "text-sage" : "text-danger"}`}>
                    {chosen === question.correctIndex ? "Correct. " : "Not quite. "}
                  </span>
                  {question.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between gap-2 border-t border-line px-3.5 py-2.5">
          <span className="text-xs text-mist">
            {answeredCount === total
              ? "Ready to check"
              : `Answer ${total - answeredCount} more to check`}
          </span>
          <Button
            disabled={answeredCount < total}
            onClick={handleCheckAnswers}
            className="btn btn-primary btn-sm"
          >
            Check answers
          </Button>
        </div>
      )}
    </div>
  );
}
