"use client";

import { useId, useState } from "react";
import { Button } from "@ui-sdk/react/button";
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio";
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Trophy,
  XCircle,
} from "lucide-react";
import type { InteractiveQuizPayload } from "@/lib/types";

interface LearnlyQuizCardProps {
  quiz: InteractiveQuizPayload;
}

export function LearnlyQuizCard({ quiz }: LearnlyQuizCardProps) {
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
    <div className="mt-3 overflow-hidden rounded-xl border border-indigo-200/80 bg-white shadow-xs dark:border-indigo-900/60 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2 border-b border-indigo-100 bg-indigo-50/70 px-3.5 py-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/40">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-indigo-700 uppercase dark:text-indigo-300">
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
            Interactive Quiz
          </p>
          <h4 className="truncate text-xs font-semibold text-zinc-950 dark:text-zinc-50">
            {quiz.title}
          </h4>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-medium text-indigo-700 ring-1 ring-indigo-200/80 dark:bg-zinc-900 dark:text-indigo-300 dark:ring-indigo-800/70">
          {submitted ? `${score}/${total}` : `${answeredCount}/${total}`}
        </span>
      </div>

      {submitted && (
        <div className="flex items-center justify-between gap-2 border-b border-zinc-200/80 bg-zinc-50/90 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <Trophy
              className={`h-4 w-4 shrink-0 ${
                score === total
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-indigo-600 dark:text-indigo-400"
              }`}
              aria-hidden="true"
            />
            <span>
              Score: {score}/{total} ({scorePercent}%)
            </span>
          </div>
          <Button
            onClick={handleRetry}
            className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
        {quiz.questions.map((question, qIdx) => {
          const chosen = selections[question.id];
          const groupLabelId = `${baseId}-q-${question.id}`;

          return (
            <div key={question.id} className="p-3.5">
              <p
                id={groupLabelId}
                className="text-xs leading-relaxed font-semibold text-zinc-900 dark:text-zinc-100"
              >
                <span className="mr-1.5 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  Q{qIdx + 1}.
                </span>
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

                  let cardClasses =
                    "border-zinc-200 bg-zinc-50/50 text-zinc-800 hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-200 dark:hover:border-indigo-700";

                  if (submitted) {
                    if (isCorrect) {
                      cardClasses =
                        "border-emerald-500 bg-emerald-50/90 text-emerald-950 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-100";
                    } else if (isSelected && !isCorrect) {
                      cardClasses =
                        "border-rose-500 bg-rose-50/90 text-rose-950 dark:border-rose-600 dark:bg-rose-950/50 dark:text-rose-100";
                    } else {
                      cardClasses =
                        "border-zinc-200/70 bg-zinc-50/30 text-zinc-500 opacity-70 dark:border-zinc-800/70 dark:bg-zinc-950/30 dark:text-zinc-400";
                    }
                  } else if (isSelected) {
                    cardClasses =
                      "border-indigo-600 bg-indigo-50/80 text-indigo-950 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-100";
                  }

                  return (
                    <label
                      key={`${question.id}-${optionValue}`}
                      className={`flex items-start gap-2.5 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      } ${cardClasses}`}
                    >
                      <Radio
                        value={optionValue}
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current/35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 data-checked:border-indigo-600 dark:data-checked:border-indigo-400"
                      >
                        <RadioIndicator className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      </Radio>

                      <span className="flex-1 leading-snug">
                        <span className="mr-1.5 font-mono text-[11px] font-semibold opacity-75">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {option}
                      </span>

                      {submitted && isCorrect && (
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400"
                          aria-hidden="true"
                        />
                      )}
                    </label>
                  );
                })}
              </RadioGroup>

              {submitted && (
                <p className="mt-2.5 rounded-lg bg-zinc-100/80 px-2.5 py-2 text-[11px] leading-relaxed text-zinc-700 dark:bg-zinc-950 dark:text-zinc-300">
                  <strong className="font-semibold text-zinc-950 dark:text-zinc-100">
                    Explanation:{" "}
                  </strong>
                  {question.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center justify-between gap-2 border-t border-zinc-100 bg-zinc-50/70 px-3.5 py-2.5 dark:border-zinc-800 dark:bg-zinc-950/60">
          <span className="text-[11px] text-zinc-600 dark:text-zinc-400">
            {answeredCount === total
              ? "Ready to grade"
              : `Select ${total - answeredCount} more`}
          </span>
          <Button
            disabled={answeredCount < total}
            onClick={handleCheckAnswers}
            className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 data-disabled:cursor-not-allowed data-disabled:opacity-50"
          >
            Check Answers
          </Button>
        </div>
      )}
    </div>
  );
}
