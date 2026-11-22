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
    <div className="mt-3 overflow-hidden rounded-2xl border-2 border-[#18181B] bg-white shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[3px_3px_0_0_#000000]">
      <div className="flex items-center justify-between gap-2 border-b-2 border-[#18181B] bg-[#FFB800] px-3.5 py-2.5 text-[#111116]">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[10px] font-extrabold tracking-wide uppercase">
            <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
            Interactive Quiz
          </p>
          <h4 className="font-display truncate text-xs font-extrabold">
            {quiz.title}
          </h4>
        </div>
        <span className="shrink-0 rounded-full border-2 border-[#18181B] bg-white px-2 py-0.5 font-mono text-[11px] font-extrabold text-[#111116]">
          {submitted ? `${score}/${total}` : `${answeredCount}/${total}`}
        </span>
      </div>

      {submitted && (
        <div className="animate-pop-in flex items-center justify-between gap-2 border-b-2 border-[#18181B]/15 bg-[#F6EFE0] px-3.5 py-2.5 dark:border-[#2A2A3B] dark:bg-[#12121A]">
          <div className="flex items-center gap-2 text-xs font-extrabold text-[#111116] dark:text-[#FAFAF5]">
            <Trophy
              className={`h-4 w-4 shrink-0 ${
                score === total
                  ? "text-[#047857] dark:text-[#34D399]"
                  : "text-[#D93817] dark:text-[#FF6B4A]"
              }`}
              aria-hidden="true"
            />
            <span>
              Score: {score}/{total} ({scorePercent}%)
            </span>
          </div>
          <Button
            onClick={handleRetry}
            className="tactile-btn-sm inline-flex cursor-pointer items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#111116] hover:bg-[#FFB800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      <div className="divide-y divide-[#E6DCC6] dark:divide-[#2A2A3B]">
        {quiz.questions.map((question, qIdx) => {
          const chosen = selections[question.id];
          const groupLabelId = `${baseId}-q-${question.id}`;

          return (
            <div key={question.id} className="p-3.5">
              <p
                id={groupLabelId}
                className="text-xs leading-relaxed font-bold text-[#111116] dark:text-[#FAFAF5]"
              >
                <span className="mr-1.5 inline-flex rounded border border-[#18181B] bg-[#FFB800] px-1 font-mono text-[10px] font-extrabold text-[#111116]">
                  Q{qIdx + 1}
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
                    "border-[#18181B]/20 bg-[#FFFBF2] text-[#111116] hover:border-[#18181B] hover:bg-white dark:border-[#3A3A52] dark:bg-[#12121A] dark:text-[#FAFAF5] dark:hover:border-[#FFB800]";

                  if (submitted) {
                    if (isCorrect) {
                      cardClasses =
                        "border-[#047857] bg-[#00B87C]/20 text-[#111116] dark:border-[#34D399] dark:bg-[#00B87C]/20 dark:text-[#FAFAF5]";
                    } else if (isSelected && !isCorrect) {
                      cardClasses =
                        "border-[#D93817] bg-[#FF5A36]/20 text-[#111116] dark:border-[#FF6B4A] dark:bg-[#FF5A36]/20 dark:text-[#FAFAF5]";
                    } else {
                      cardClasses =
                        "border-[#18181B]/15 bg-[#F6EFE0]/60 text-[#52525B] dark:border-[#2A2A3B] dark:bg-[#12121A]/70 dark:text-[#B4B4C6]";
                    }
                  } else if (isSelected) {
                    cardClasses =
                      "border-[#18181B] bg-[#FFB800] text-[#111116] dark:border-[#18181B] dark:bg-[#FFB800] dark:text-[#111116]";
                  }

                  return (
                    <label
                      key={`${question.id}-${optionValue}`}
                      className={`flex items-start gap-2.5 rounded-xl border-2 px-2.5 py-2 text-xs font-semibold transition-colors ${
                        submitted ? "cursor-default" : "cursor-pointer"
                      } ${cardClasses}`}
                    >
                      <Radio
                        value={optionValue}
                        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-current/50 bg-white/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-checked:border-[#111116] dark:bg-[#16161F]"
                      >
                        <RadioIndicator className="h-2 w-2 rounded-full bg-[#111116] dark:bg-[#FFB800]" />
                      </Radio>

                      <span className="flex-1 leading-snug">
                        <span className="mr-1.5 font-mono text-[11px] font-extrabold opacity-80">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        {option}
                      </span>

                      {submitted && isCorrect && (
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#047857] dark:text-[#34D399]"
                          aria-hidden="true"
                        />
                      )}
                      {submitted && isSelected && !isCorrect && (
                        <XCircle
                          className="mt-0.5 h-4 w-4 shrink-0 text-[#D93817] dark:text-[#FF6B4A]"
                          aria-hidden="true"
                        />
                      )}
                    </label>
                  );
                })}
              </RadioGroup>

              {submitted && (
                <p className="mt-2.5 rounded-xl border border-dashed border-[#18181B]/25 bg-[#F6EFE0] px-2.5 py-2 text-[11px] leading-relaxed text-[#111116] dark:border-[#3A3A52] dark:bg-[#12121A] dark:text-[#D4D4E2]">
                  <strong className="font-extrabold text-[#111116] dark:text-[#FAFAF5]">
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
        <div className="flex items-center justify-between gap-2 border-t-2 border-[#18181B]/15 bg-[#F6EFE0] px-3.5 py-2.5 dark:border-[#2A2A3B] dark:bg-[#12121A]">
          <span className="font-mono text-[11px] font-bold text-[#52525B] dark:text-[#B4B4C6]">
            {answeredCount === total
              ? "Ready to grade"
              : `Select ${total - answeredCount} more`}
          </span>
          <Button
            disabled={answeredCount < total}
            onClick={handleCheckAnswers}
            className="tactile-btn-sm cursor-pointer rounded-xl bg-[#FF5A36] px-3.5 py-1.5 text-xs font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] data-disabled:cursor-not-allowed data-disabled:opacity-50"
          >
            Check Answers
          </Button>
        </div>
      )}
    </div>
  );
}
