"use client";

import { useId, useState, type ReactNode } from "react";
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
import { Check, Loader2, Plus, Trash2, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import type { QuizQuestion } from "@/lib/types";
import { MarkdownContent } from "@/components/course/MarkdownContent";
import { MuxUploader, type MuxUploadResult } from "./MuxUploader";

/* ── Shared studio pieces (also used by AdminStudioClient) ──────────── */

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const TAB_LIST_CLASS = "flex gap-5 overflow-x-auto border-b border-line px-5";
export const TAB_CLASS =
  "-mb-px inline-flex h-11 shrink-0 cursor-pointer items-center gap-1.5 border-b-2 border-transparent text-sm font-medium text-mist transition-colors duration-150 hover:text-ink data-selected:border-primary data-selected:text-ink";
export const DIALOG_FOOTER_CLASS =
  "flex items-center justify-end gap-2 border-t border-line px-5 py-4";

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  rows?: number;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  mono?: boolean;
  className?: string;
  /** Inline error shown under the control; marks it invalid. */
  error?: string;
}

export function TextField({
  label,
  onChange,
  type = "text",
  rows,
  min,
  max,
  step,
  mono,
  className,
  error,
  ...rest
}: TextFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const fieldClass = `field mt-1.5${mono ? " font-mono text-xs" : ""}${error ? " border-danger" : ""}`;
  const a11y = {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
  };
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      {rows ? (
        <textarea
          id={id}
          rows={rows}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
          {...a11y}
          {...rest}
        />
      ) : (
        <input
          id={id}
          type={type}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass}
          {...a11y}
          {...rest}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-[10px] border border-line bg-surface px-3.5 py-3 transition-colors duration-150 hover:bg-subtle/60">
      <span className="min-w-0">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="block text-xs text-mist">{description}</span>
        )}
      </span>
      <Switch
        checked={checked}
        onCheckedChange={(next) => onCheckedChange(next)}
        className="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full bg-mist/40 transition-colors duration-150 data-checked:bg-accent"
      >
        <SwitchThumb className="block size-5 translate-x-0.5 rounded-full bg-surface shadow-sm transition-transform duration-200 ease-(--ease-out) data-checked:translate-x-4.5 motion-reduce:transition-none" />
      </Switch>
    </label>
  );
}

export function StudioDialog({
  open,
  onOpenChange,
  title,
  description,
  className = "max-w-lg",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => onOpenChange(next)}>
      <DialogBackdrop className="fixed inset-0 z-50 bg-night/60 transition-opacity duration-200 ease-(--ease-out) data-starting-style:opacity-0 data-ending-style:opacity-0" />
      <DialogContent
        className={`fixed top-1/2 left-1/2 z-50 flex max-h-[90dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line bg-surface text-ink shadow-card transition-[opacity,scale] duration-200 ease-(--ease-out) data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-opacity motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100 ${className}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <DialogTitle className="text-lg font-bold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="mt-0.5 text-sm text-mist">
                {description}
              </DialogDescription>
            )}
          </div>
          <DialogClose
            aria-label="Close dialog"
            className="btn btn-ghost btn-icon -mt-1 -mr-2 shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </DialogClose>
        </div>
        {children}
      </DialogContent>
    </Dialog>
  );
}

/* ── Lesson editor ──────────────────────────────────────────────────── */

const OPTION_LETTERS = ["A", "B", "C", "D"] as const;

function createEmptyQuestion(): QuizQuestion {
  return {
    // randomUUID is missing on plain-http LAN dev hosts.
    id: `q-${crypto.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10)}`,
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
    options: OPTION_LETTERS.map((_, i) => q.options[i] ?? ""),
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
      "# Lesson notes\n\nExplain the idea, show the code, and end with the key takeaways.\n",
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
  const [tab, setTab] = useState("details");
  // Keys: "title", "slug", or a quiz question id.
  const [errors, setErrors] = useState<Record<string, string>>({});

  function clearError(key: string) {
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    clearError("title");
    if (!slugTouched) {
      setSlug(slugify(nextTitle));
      clearError("slug");
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
    toast.success("Video uploaded and ready to play.");
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

  function updateQuizQuestion(id: string, patch: Partial<QuizQuestion>) {
    setQuiz((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
    clearError(id);
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanSlug = slugify(slug || title);
    const cleanSummary = summary.trim();

    const nextErrors: Record<string, string> = {};
    if (!cleanTitle) nextErrors.title = "Add a lesson title.";
    if (!cleanSlug) nextErrors.slug = "Use letters or numbers in the slug.";
    for (const q of quiz) {
      if (!q.question.trim()) nextErrors[q.id] = "Add a prompt for this question.";
      else if (q.options.some((opt) => !opt.trim()))
        nextErrors[q.id] = "Fill in all four answers.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTab(nextErrors.title || nextErrors.slug ? "details" : "quiz");
      return;
    }
    setErrors({});

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
        toast.success(`Saved "${cleanTitle}".`);
      } else {
        if (!moduleId) {
          toast.error("Choose a module before creating a lesson.");
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
        error instanceof Error
          ? error.message
          : "Couldn't save the lesson. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form noValidate onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
      <Tabs
        value={tab}
        onValueChange={(next) => {
          if (next) setTab(next);
        }}
        className="flex min-h-0 flex-1 flex-col"
      >
        <TabsList aria-label="Lesson editor sections" className={TAB_LIST_CLASS}>
          <TabsTab value="details" className={TAB_CLASS}>
            Details
          </TabsTab>
          <TabsTab value="video" className={TAB_CLASS}>
            Video
            {muxPlaybackId.trim() && (
              <span className="size-1.5 rounded-full bg-success" aria-hidden="true" />
            )}
          </TabsTab>
          <TabsTab value="markdown" className={TAB_CLASS}>
            Notes
          </TabsTab>
          <TabsTab value="quiz" className={TAB_CLASS}>
            Quiz
            <span className="rounded-full bg-subtle px-1.5 text-xs text-mist tabular-nums">
              {quiz.length}
            </span>
          </TabsTab>
        </TabsList>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          <TabsPanel value="details" keepMounted className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                label="Title"
                required
                value={title}
                onChange={handleTitleChange}
                placeholder="Spacing systems that scale"
                error={errors.title}
              />
              <TextField
                label="Slug"
                required
                mono
                value={slug}
                error={errors.slug}
                onChange={(next) => {
                  setSlugTouched(true);
                  setSlug(next);
                  clearError("slug");
                }}
                placeholder="cache-components-and-suspense"
              />
            </div>

            <TextField
              label="Summary"
              rows={3}
              value={summary}
              onChange={setSummary}
              placeholder="A short overview for the curriculum list and the AI tutor."
            />

            <fieldset>
              <legend className="text-sm font-medium">Duration</legend>
              <div className="mt-1.5 grid max-w-xs grid-cols-2 gap-3">
                <TextField
                  label="Minutes"
                  type="number"
                  min={0}
                  max={600}
                  value={durationMinutes}
                  onChange={setDurationMinutes}
                  className="text-mist"
                />
                <TextField
                  label="Seconds"
                  type="number"
                  min={0}
                  max={59}
                  value={durationRemainderSeconds}
                  onChange={setDurationRemainderSeconds}
                  className="text-mist"
                />
              </div>
            </fieldset>

            <SettingSwitch
              label="Free preview"
              description="Let learners without Pro watch this lesson."
              checked={isFreePreview}
              onCheckedChange={setIsFreePreview}
            />
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

          <TabsPanel value="markdown" keepMounted>
            <Tabs defaultValue="write" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label htmlFor={markdownId} className="text-sm font-medium">
                  Notes in Markdown
                </label>
                <TabsList
                  aria-label="Notes view"
                  className="inline-flex rounded-md bg-subtle p-0.5"
                >
                  {(["write", "preview"] as const).map((mode) => (
                    <TabsTab
                      key={mode}
                      value={mode}
                      className="h-7 cursor-pointer rounded-[5px] px-3 text-xs font-medium text-mist transition-colors duration-150 data-selected:bg-surface data-selected:text-ink data-selected:shadow-sm"
                    >
                      {mode === "write" ? "Write" : "Preview"}
                    </TabsTab>
                  ))}
                </TabsList>
              </div>

              <TabsPanel value="write" keepMounted>
                <textarea
                  id={markdownId}
                  rows={16}
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="# Lesson title"
                  className="field font-mono text-xs leading-relaxed"
                />
              </TabsPanel>

              <TabsPanel value="preview">
                <div className="min-h-80 rounded-[10px] border border-line p-5">
                  {markdownContent.trim() ? (
                    <MarkdownContent content={markdownContent} />
                  ) : (
                    <p className="text-sm text-mist">
                      Nothing to preview yet. Write some notes first.
                    </p>
                  )}
                </div>
              </TabsPanel>
            </Tabs>
          </TabsPanel>

          <TabsPanel value="quiz" keepMounted className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-mist">
                Multiple-choice questions shown after the lesson.
              </p>
              <button
                type="button"
                onClick={() => setQuiz((prev) => [...prev, createEmptyQuestion()])}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                Add question
              </button>
            </div>

            {quiz.length === 0 ? (
              <div className="rounded-[14px] border border-dashed border-line px-6 py-10 text-center">
                <p className="text-sm font-medium">No questions yet</p>
                <p className="mt-1 text-sm text-mist">
                  Add a question to check what learners took away.
                </p>
              </div>
            ) : (
              quiz.map((q, qIdx) => (
                <div
                  key={q.id}
                  className={`space-y-3 rounded-[14px] border bg-surface p-4 ${
                    errors[q.id] ? "border-danger" : "border-line"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">Question {qIdx + 1}</h3>
                    <button
                      type="button"
                      onClick={() =>
                        setQuiz((prev) => prev.filter((item) => item.id !== q.id))
                      }
                      aria-label={`Remove question ${qIdx + 1}`}
                      className="btn btn-ghost btn-sm text-danger"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Remove
                    </button>
                  </div>

                  <TextField
                    label="Prompt"
                    value={q.question}
                    onChange={(question) => updateQuizQuestion(q.id, { question })}
                    placeholder="What happens when…?"
                  />

                  <div>
                    <p className="text-sm font-medium">
                      Answers{" "}
                      <span className="font-normal text-mist">
                        (select the correct one)
                      </span>
                    </p>
                    <div className="mt-1.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {OPTION_LETTERS.map((letter, optIdx) => {
                        const isCorrect = q.correctIndex === optIdx;
                        return (
                          <div
                            key={letter}
                            className={`flex items-center gap-2 rounded-md border px-2.5 ${
                              isCorrect ? "border-accent bg-accent/5" : "border-line"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`${q.id}-correct`}
                              checked={isCorrect}
                              onChange={() =>
                                updateQuizQuestion(q.id, { correctIndex: optIdx })
                              }
                              aria-label={`Answer ${letter} is correct`}
                              className="size-4 shrink-0 cursor-pointer accent-(--accent)"
                            />
                            <input
                              type="text"
                              aria-label={`Answer ${letter} for question ${qIdx + 1}`}
                              value={q.options[optIdx] ?? ""}
                              onChange={(e) =>
                                updateQuizQuestion(q.id, {
                                  options: q.options.map((o, i) =>
                                    i === optIdx ? e.target.value : o,
                                  ),
                                })
                              }
                              placeholder={`Answer ${letter}`}
                              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-mist"
                            />
                            {isCorrect && (
                              <Check
                                className="h-4 w-4 shrink-0 text-accent-ink"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <TextField
                    label="Explanation"
                    rows={2}
                    value={q.explanation}
                    onChange={(explanation) =>
                      updateQuizQuestion(q.id, { explanation })
                    }
                    placeholder="Why the correct answer is right."
                  />
                  {errors[q.id] && (
                    <p className="text-xs text-danger">{errors[q.id]}</p>
                  )}
                </div>
              ))
            )}
          </TabsPanel>
        </div>
      </Tabs>

      <div className={DIALOG_FOOTER_CLASS}>
        <DialogClose className="btn btn-secondary">Cancel</DialogClose>
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {lesson ? "Save lesson" : "Create lesson"}
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
    <StudioDialog
      open={open}
      onOpenChange={onOpenChange}
      title={lesson ? "Edit lesson" : "New lesson"}
      description={moduleTitle ? `In ${moduleTitle}` : undefined}
      className="max-w-3xl"
    >
      <LessonEditorForm
        key={`${lesson?._id ?? "new"}-${lesson?.updatedAt ?? 0}-${moduleId ?? "none"}`}
        courseId={courseId}
        moduleId={moduleId}
        lesson={lesson}
        onClose={() => onOpenChange(false)}
      />
    </StudioDialog>
  );
}
