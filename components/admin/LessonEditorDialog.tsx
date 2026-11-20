"use client";

import { useId, useState } from "react";
import { useMutation } from "convex/react";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@ui-sdk/react/dialog";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { toast } from "@ui-sdk/react/toast";
import {
  CheckCircle2,
  Eye,
  FileText,
  Film,
  HelpCircle,
  Loader2,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { QuizQuestion } from "@/lib/types";
import { MarkdownContent } from "@/components/course/MarkdownContent";
import { MuxUploader, type MuxUploadResult } from "./MuxUploader";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createEmptyQuestion(): QuizQuestion {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `q-${crypto.randomUUID().slice(0, 8)}`
      : `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id,
    question: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };
}

function normalizeQuiz(lesson: Doc<"lessons"> | null): QuizQuestion[] {
  if (!lesson?.quiz) return [];
  return lesson.quiz.map((q) => ({
    ...q,
    options:
      q.options.length === 4
        ? [...q.options]
        : [
            q.options[0] ?? "",
            q.options[1] ?? "",
            q.options[2] ?? "",
            q.options[3] ?? "",
          ],
  }));
}

interface LessonEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: Id<"courses">;
  moduleId: Id<"modules"> | null;
  moduleTitle?: string;
  lesson: Doc<"lessons"> | null;
}

function LessonEditorForm({
  courseId,
  moduleId,
  lesson,
  onClose,
}: {
  courseId: Id<"courses">;
  moduleId: Id<"modules"> | null;
  lesson: Doc<"lessons"> | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const slugId = useId();
  const summaryId = useId();
  const minutesId = useId();
  const secondsId = useId();
  const markdownId = useId();

  const createLesson = useMutation(api.courses.createLesson);
  const updateLesson = useMutation(api.courses.updateLesson);

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [slug, setSlug] = useState(lesson?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(lesson));
  const [summary, setSummary] = useState(lesson?.summary ?? "");
  const [durationMinutes, setDurationMinutes] = useState(
    lesson ? String(Math.floor(lesson.durationSeconds / 60)) : "10",
  );
  const [durationRemainderSeconds, setDurationRemainderSeconds] = useState(
    lesson ? String(lesson.durationSeconds % 60) : "0",
  );
  const [isFreePreview, setIsFreePreview] = useState(
    lesson?.isFreePreview ?? false,
  );
  const [markdownContent, setMarkdownContent] = useState(
    lesson?.markdownContent ??
      "# Lesson Notes\n\nWrite clear explanations, code blocks, and takeaways for students.\n",
  );
  const [muxPlaybackId, setMuxPlaybackId] = useState(
    lesson?.muxPlaybackId ?? "",
  );
  const [muxAssetId, setMuxAssetId] = useState<string | undefined>(
    lesson?.muxAssetId,
  );
  const [muxUploadId, setMuxUploadId] = useState<string | undefined>(
    lesson?.muxUploadId,
  );
  const [muxStatus, setMuxStatus] = useState<
    "idle" | "waiting" | "ready" | "errored"
  >(lesson?.muxStatus ?? "idle");
  const [quiz, setQuiz] = useState<QuizQuestion[]>(() => normalizeQuiz(lesson));
  const [saving, setSaving] = useState(false);

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugTouched) {
      setSlug(slugify(nextTitle));
    }
  }

  function handleMuxUploaded(result: MuxUploadResult) {
    setMuxPlaybackId(result.playbackId);
    setMuxAssetId(result.assetId);
    setMuxUploadId(result.uploadId);
    setMuxStatus("ready");
    if (result.durationSeconds && result.durationSeconds > 0) {
      setDurationMinutes(String(Math.floor(result.durationSeconds / 60)));
      setDurationRemainderSeconds(String(result.durationSeconds % 60));
    }
    toast.success("Video uploaded and ready on Mux!");
  }

  function handlePlaybackIdChange(nextPlaybackId: string) {
    setMuxPlaybackId(nextPlaybackId);
    setMuxStatus(nextPlaybackId.trim() ? "ready" : "idle");
  }

  function handleClearVideo() {
    setMuxPlaybackId("");
    setMuxAssetId(undefined);
    setMuxUploadId(undefined);
    setMuxStatus("idle");
  }

  function updateQuizQuestion(
    id: string,
    updater: (q: QuizQuestion) => QuizQuestion,
  ) {
    setQuiz((prev) => prev.map((q) => (q.id === id ? updater(q) : q)));
  }

  function removeQuizQuestion(id: string) {
    setQuiz((prev) => prev.filter((q) => q.id !== id));
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanSlug = slugify(slug || title);
    const cleanSummary = summary.trim();

    if (!cleanTitle) {
      toast.error("Please enter a lesson title.");
      return;
    }
    if (!cleanSlug) {
      toast.error("Please enter a valid lesson slug.");
      return;
    }

    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (!q.question.trim()) {
        toast.error(`Quiz question #${i + 1} is missing its prompt.`);
        return;
      }
      if (q.options.some((opt) => !opt.trim())) {
        toast.error(
          `Quiz question #${i + 1} needs all 4 answer options filled.`,
        );
        return;
      }
    }

    const mins = Math.max(0, Number.parseInt(durationMinutes || "0", 10) || 0);
    const secs = Math.max(
      0,
      Math.min(59, Number.parseInt(durationRemainderSeconds || "0", 10) || 0),
    );
    const totalDurationSeconds = mins * 60 + secs;

    const cleanPlaybackId = muxPlaybackId.trim() || undefined;
    const cleanQuiz = quiz.map((q) => ({
      id: q.id,
      question: q.question.trim(),
      options: q.options.map((o) => o.trim()),
      correctIndex: q.correctIndex,
      explanation: q.explanation.trim(),
    }));

    setSaving(true);
    try {
      if (lesson) {
        await updateLesson({
          lessonId: lesson._id,
          title: cleanTitle,
          slug: cleanSlug,
          summary: cleanSummary,
          isFreePreview,
          durationSeconds: totalDurationSeconds,
          markdownContent,
          muxAssetId,
          muxPlaybackId: cleanPlaybackId,
          muxUploadId,
          muxStatus: cleanPlaybackId ? "ready" : muxStatus,
          quiz: cleanQuiz,
        });
        toast.success(`Updated "${cleanTitle}".`);
      } else {
        if (!moduleId) {
          toast.error("Select a module before creating a lesson.");
          return;
        }
        await createLesson({
          courseId,
          moduleId,
          title: cleanTitle,
          slug: cleanSlug,
          summary: cleanSummary,
          isFreePreview,
          durationSeconds: totalDurationSeconds,
          markdownContent,
          muxAssetId,
          muxPlaybackId: cleanPlaybackId,
          muxUploadId,
          muxStatus: cleanPlaybackId ? "ready" : "idle",
          quiz: cleanQuiz,
        });
        toast.success(`Created "${cleanTitle}".`);
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save lesson.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
      <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-zinc-200 bg-zinc-50/70 px-6 dark:border-zinc-800 dark:bg-zinc-900/50">
          <TabsList
            aria-label="Lesson editor sections"
            className="flex flex-wrap gap-1 py-2"
          >
            <TabsTab
              value="details"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-950 data-selected:bg-zinc-950 data-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:data-selected:bg-white dark:data-selected:text-zinc-950"
            >
              <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
              Details
            </TabsTab>
            <TabsTab
              value="video"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-950 data-selected:bg-zinc-950 data-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:data-selected:bg-white dark:data-selected:text-zinc-950"
            >
              <Film className="h-3.5 w-3.5" aria-hidden="true" />
              Mux Video
              {muxPlaybackId.trim() && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </TabsTab>
            <TabsTab
              value="markdown"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-950 data-selected:bg-zinc-950 data-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:data-selected:bg-white dark:data-selected:text-zinc-950"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden="true" />
              Markdown Notes
            </TabsTab>
            <TabsTab
              value="quiz"
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-200/60 hover:text-zinc-950 data-selected:bg-zinc-950 data-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:data-selected:bg-white dark:data-selected:text-zinc-950"
            >
              <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Quiz ({quiz.length})
            </TabsTab>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <TabsPanel value="details" keepMounted className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={titleId}
                  className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                >
                  Lesson Title
                </label>
                <input
                  id={titleId}
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Cache Components & Suspense"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
              <div>
                <label
                  htmlFor={slugId}
                  className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                >
                  Slug
                </label>
                <input
                  id={slugId}
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value);
                  }}
                  placeholder="cache-components-and-suspense"
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-xs text-zinc-950 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor={summaryId}
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
              >
                Lesson Summary
              </label>
              <textarea
                id={summaryId}
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Short overview shown in curriculum lists and shared with the Learnly AI Tutor..."
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
              <div>
                <label
                  htmlFor={minutesId}
                  className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                >
                  Minutes
                </label>
                <input
                  id={minutesId}
                  type="number"
                  min={0}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
              <div>
                <label
                  htmlFor={secondsId}
                  className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                >
                  Seconds
                </label>
                <input
                  id={secondsId}
                  type="number"
                  min={0}
                  max={59}
                  value={durationRemainderSeconds}
                  onChange={(e) => setDurationRemainderSeconds(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                />
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div>
                <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Free Preview
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  Free Preview — allow non-Pro users to watch this lesson
                </p>
              </div>
              <Switch
                checked={isFreePreview}
                onCheckedChange={(checked) => setIsFreePreview(checked)}
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 data-checked:bg-indigo-600 data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700"
              >
                <SwitchThumb className="block h-5 w-5 rounded-full bg-white shadow-xs transition-transform data-checked:translate-x-5.5 data-unchecked:translate-x-0.5" />
              </Switch>
            </label>
          </TabsPanel>

          <TabsPanel value="video" keepMounted>
            <MuxUploader
              playbackId={muxPlaybackId}
              assetId={muxAssetId}
              muxStatus={muxStatus}
              onPlaybackIdChange={handlePlaybackIdChange}
              onUploaded={handleMuxUploaded}
              onClear={handleClearVideo}
            />
          </TabsPanel>

          <TabsPanel value="markdown" keepMounted className="space-y-3">
            <Tabs defaultValue="write" className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor={markdownId}
                  className="text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                >
                  GitHub-Flavored Markdown
                </label>
                <TabsList
                  aria-label="Markdown mode"
                  className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <TabsTab
                    value="write"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors data-selected:bg-white data-selected:text-zinc-950 data-selected:shadow-xs dark:text-zinc-400 dark:data-selected:bg-zinc-800 dark:data-selected:text-zinc-50"
                  >
                    <FileText className="h-3 w-3" aria-hidden="true" />
                    Write
                  </TabsTab>
                  <TabsTab
                    value="preview"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-zinc-600 transition-colors data-selected:bg-white data-selected:text-zinc-950 data-selected:shadow-xs dark:text-zinc-400 dark:data-selected:bg-zinc-800 dark:data-selected:text-zinc-50"
                  >
                    <Eye className="h-3 w-3" aria-hidden="true" />
                    Live Preview
                  </TabsTab>
                </TabsList>
              </div>

              <TabsPanel value="write" keepMounted>
                <textarea
                  id={markdownId}
                  rows={16}
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="# Lesson Title&#10;&#10;Write rich Markdown notes with fenced code blocks..."
                  className="w-full rounded-xl border border-zinc-200 bg-white p-4 font-mono text-xs leading-relaxed text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </TabsPanel>

              <TabsPanel value="preview">
                <div className="min-h-[320px] rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
                  {markdownContent.trim() ? (
                    <MarkdownContent content={markdownContent} />
                  ) : (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Nothing to preview yet. Switch to Write to compose lesson
                      notes.
                    </p>
                  )}
                </div>
              </TabsPanel>
            </Tabs>
          </TabsPanel>

          <TabsPanel value="quiz" keepMounted className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                  Interactive Lesson Quiz
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Add multiple-choice knowledge checks with explanations.
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setQuiz((prev) => [...prev, createEmptyQuestion()])
                }
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add Question
              </button>
            </div>

            {quiz.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-10 text-center dark:border-zinc-800">
                <HelpCircle
                  className="mx-auto h-7 w-7 text-zinc-400"
                  aria-hidden="true"
                />
                <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  No quiz questions yet
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Click &ldquo;Add Question&rdquo; to attach an interactive quiz
                  to this lesson.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {quiz.map((q, qIdx) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4 dark:border-zinc-800 dark:bg-zinc-900/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
                        Question {qIdx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeQuizQuestion(q.id)}
                        aria-label={`Delete question ${qIdx + 1}`}
                        className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    </div>

                    <div className="mt-3 space-y-3">
                      <div>
                        <label
                          htmlFor={`${q.id}-prompt`}
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Question Prompt
                        </label>
                        <input
                          id={`${q.id}-prompt`}
                          type="text"
                          value={q.question}
                          onChange={(e) =>
                            updateQuizQuestion(q.id, (curr) => ({
                              ...curr,
                              question: e.target.value,
                            }))
                          }
                          placeholder="What happens when...?"
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50"
                        />
                      </div>

                      <fieldset className="space-y-2">
                        <legend className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Answer Options (select the correct one)
                        </legend>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(["A", "B", "C", "D"] as const).map(
                            (letter, optIdx) => {
                              const isCorrect = q.correctIndex === optIdx;
                              return (
                                <div
                                  key={`${q.id}-${letter}`}
                                  className={`flex items-center gap-2 rounded-lg border p-2 transition-colors ${
                                    isCorrect
                                      ? "border-emerald-500 bg-emerald-50/70 dark:border-emerald-600 dark:bg-emerald-950/30"
                                      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    id={`${q.id}-correct-${letter}`}
                                    name={`${q.id}-correct`}
                                    checked={isCorrect}
                                    onChange={() =>
                                      updateQuizQuestion(q.id, (curr) => ({
                                        ...curr,
                                        correctIndex: optIdx,
                                      }))
                                    }
                                    aria-label={`Mark option ${letter} as correct for question ${qIdx + 1}`}
                                    className="h-4 w-4 cursor-pointer accent-emerald-600"
                                  />
                                  <input
                                    type="text"
                                    aria-label={`Option ${letter} for question ${qIdx + 1}`}
                                    value={q.options[optIdx] ?? ""}
                                    onChange={(e) =>
                                      updateQuizQuestion(q.id, (curr) => {
                                        const nextOptions = [...curr.options];
                                        nextOptions[optIdx] = e.target.value;
                                        return {
                                          ...curr,
                                          options: nextOptions,
                                        };
                                      })
                                    }
                                    placeholder={`Option ${letter}`}
                                    className="w-full bg-transparent text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none dark:text-zinc-100"
                                  />
                                  {isCorrect && (
                                    <CheckCircle2
                                      className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </fieldset>

                      <div>
                        <label
                          htmlFor={`${q.id}-explanation`}
                          className="block text-xs font-medium text-zinc-700 dark:text-zinc-300"
                        >
                          Explanation
                        </label>
                        <textarea
                          id={`${q.id}-explanation`}
                          rows={2}
                          value={q.explanation}
                          onChange={(e) =>
                            updateQuizQuestion(q.id, (curr) => ({
                              ...curr,
                              explanation: e.target.value,
                            }))
                          }
                          placeholder="Explain why the correct answer is right..."
                          className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsPanel>
        </div>
      </Tabs>

      <div className="flex items-center justify-end gap-2.5 border-t border-zinc-200 bg-zinc-50/70 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
        <DialogClose className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
          Cancel
        </DialogClose>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {saving && (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          )}
          {lesson ? "Save Lesson" : "Create Lesson"}
        </button>
      </div>
    </form>
  );
}

export function LessonEditorDialog({
  open,
  onOpenChange,
  courseId,
  moduleId,
  moduleTitle,
  lesson,
}: LessonEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogBackdrop className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
      <DialogContent className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-4xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-[opacity,scale] duration-200 data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
          <div>
            <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {lesson ? "Edit Lesson" : "New Lesson"}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {moduleTitle
                ? `Module: ${moduleTitle}`
                : "Configure lesson metadata, Mux video, Markdown notes, and quiz questions."}
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close lesson editor"
            className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogClose>
        </div>

        <LessonEditorForm
          key={`${lesson?._id ?? "new"}-${lesson?.updatedAt ?? 0}-${moduleId ?? "none"}`}
          courseId={courseId}
          moduleId={moduleId}
          lesson={lesson}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
