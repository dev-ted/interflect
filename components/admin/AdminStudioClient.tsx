"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Authenticated,
  AuthLoading,
  useMutation,
  useQuery,
} from "convex/react";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@ui-sdk/react/alert-dialog";
import { DialogClose } from "@ui-sdk/react/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { toast } from "@ui-sdk/react/toast";
import {
  Check,
  ChevronDown,
  Eye,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DIALOG_FOOTER_CLASS,
  LessonEditorDialog,
  SettingSwitch,
  StudioDialog,
  TAB_CLASS,
  TAB_LIST_CLASS,
  TextField,
  slugify,
} from "./LessonEditorDialog";

type CourseLevel = "beginner" | "intermediate" | "advanced";
type CourseTier = "free" | "pro";

const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TIER_OPTIONS: Array<{ value: CourseTier; label: string }> = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

/* ── Course form (shared by "New course" and the Settings tab) ─────── */

interface CourseValues {
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  thumbnailUrl: string;
  category: string;
  level: CourseLevel;
  tier: CourseTier;
  published: boolean;
  featured: boolean;
  estimatedHours: string;
  tags: string;
}

const NEW_COURSE: CourseValues = {
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  thumbnailUrl: DEFAULT_THUMBNAIL,
  category: "Full-Stack Engineering",
  level: "intermediate",
  tier: "pro",
  published: false,
  featured: false,
  estimatedHours: "6",
  tags: "Next.js 16, React 19, TypeScript",
};

function valuesFromCourse(course: Doc<"courses">): CourseValues {
  return {
    title: course.title,
    slug: course.slug,
    subtitle: course.subtitle,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    category: course.category,
    level: course.level,
    tier: course.tier,
    published: course.published,
    featured: course.featured,
    estimatedHours: String(course.estimatedHours),
    tags: course.tags.join(", "),
  };
}

function toCourseArgs(v: CourseValues) {
  return {
    title: v.title.trim(),
    slug: slugify(v.slug || v.title),
    subtitle: v.subtitle.trim(),
    description: v.description.trim(),
    thumbnailUrl: v.thumbnailUrl.trim() || DEFAULT_THUMBNAIL,
    category: v.category.trim(),
    level: v.level,
    tier: v.tier,
    published: v.published,
    featured: v.featured,
    estimatedHours: Math.max(1, Number.parseFloat(v.estimatedHours || "1") || 1),
    tags: v.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  };
}

type CourseArgs = ReturnType<typeof toCourseArgs>;

function OptionSelect<T extends string>({
  label,
  items,
  value,
  onChange,
}: {
  label: string;
  items: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as T);
      }}
    >
      <SelectLabel className="block text-sm font-medium">{label}</SelectLabel>
      <SelectTrigger className="field mt-1.5 flex cursor-pointer items-center justify-between text-left">
        <SelectValue />
        <ChevronDown className="h-4 w-4 text-mist" aria-hidden="true" />
      </SelectTrigger>
      <SelectContent className="z-50 min-w-(--anchor-width) origin-(--transform-origin) rounded-md border border-line bg-surface p-1 text-ink shadow-card transition-[opacity,scale] duration-150 ease-(--ease-out) data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-opacity">
        {items.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="flex h-9 cursor-pointer items-center justify-between gap-3 rounded-[5px] px-2.5 text-sm outline-none data-highlighted:bg-subtle"
          >
            {opt.label}
            <SelectItemIndicator>
              <Check className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            </SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CourseForm({
  initial,
  isNew,
  submitLabel,
  onSubmit,
  bodyClassName,
  footerClassName,
  footerStart,
  footerEnd,
}: {
  initial: CourseValues;
  isNew: boolean;
  submitLabel: string;
  onSubmit: (args: CourseArgs) => Promise<void>;
  bodyClassName?: string;
  footerClassName?: string;
  footerStart?: ReactNode;
  footerEnd?: ReactNode;
}) {
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof CourseValues>(key: K, value: CourseValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const args = toCourseArgs(values);
    if (!args.title || !args.slug) {
      toast.error("Add a title and a slug to save the course.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(args);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't save the course. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className={`space-y-4 ${bodyClassName ?? ""}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Title"
            required
            value={values.title}
            onChange={(title) =>
              setValues((prev) => ({
                ...prev,
                title,
                slug: slugTouched ? prev.slug : slugify(title),
              }))
            }
            placeholder="Production AI systems"
          />
          <TextField
            label="Slug"
            required
            mono
            value={values.slug}
            onChange={(slug) => {
              setSlugTouched(true);
              set("slug", slug);
            }}
            placeholder="production-ai-systems"
          />
        </div>

        <TextField
          label="Subtitle"
          value={values.subtitle}
          onChange={(v) => set("subtitle", v)}
          placeholder="One sentence on what learners will build."
        />
        <TextField
          label="Description"
          rows={4}
          value={values.description}
          onChange={(v) => set("description", v)}
        />

        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-[1fr_5.5rem]">
          <TextField
            label="Thumbnail URL"
            type="url"
            value={values.thumbnailUrl}
            onChange={(v) => set("thumbnailUrl", v)}
          />
          {values.thumbnailUrl.trim() && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={values.thumbnailUrl}
              alt="Thumbnail preview"
              className="hidden h-10 w-full rounded-md border border-line object-cover sm:block"
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <TextField
            label="Category"
            value={values.category}
            onChange={(v) => set("category", v)}
            className="col-span-2 sm:col-span-1"
          />
          <div>
            <OptionSelect
              label="Level"
              items={LEVEL_OPTIONS}
              value={values.level}
              onChange={(v) => set("level", v)}
            />
          </div>
          <div>
            <OptionSelect
              label="Access"
              items={TIER_OPTIONS}
              value={values.tier}
              onChange={(v) => set("tier", v)}
            />
          </div>
          <TextField
            label="Hours"
            type="number"
            min={1}
            step={0.5}
            value={values.estimatedHours}
            onChange={(v) => set("estimatedHours", v)}
            className="col-span-2 sm:col-span-1"
          />
        </div>

        <TextField
          label="Tags"
          value={values.tags}
          onChange={(v) => set("tags", v)}
          placeholder="Separate tags with commas"
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <SettingSwitch
            label="Published"
            description="Show it in the course catalog."
            checked={values.published}
            onCheckedChange={(v) => set("published", v)}
          />
          <SettingSwitch
            label="Featured"
            description="Highlight it on the home page."
            checked={values.featured}
            onCheckedChange={(v) => set("featured", v)}
          />
        </div>
      </div>

      <div className={`flex items-center gap-2 ${footerClassName ?? ""}`}>
        {footerStart}
        <span className="flex-1" />
        {footerEnd}
        <button type="submit" disabled={saving} className="btn btn-primary">
          {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ── Small bits ─────────────────────────────────────────────────────── */

function VideoStatus({
  status,
  hasPlaybackId,
}: {
  status: "idle" | "waiting" | "ready" | "errored";
  hasPlaybackId: boolean;
}) {
  if (status === "errored") return <span className="text-danger">Video error</span>;
  if (hasPlaybackId) return <span className="text-sage">Video ready</span>;
  if (status === "waiting") return <span>Video processing</span>;
  return <span>No video</span>;
}

function StatusDot({ published }: { published: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`size-1.5 shrink-0 rounded-full ${published ? "bg-sage" : "bg-mist/60"}`}
    />
  );
}

interface ConfirmDeleteState {
  kind: "course" | "module" | "lesson";
  id: string;
  label: string;
}

export function AdminSkeleton() {
  return (
    <div className="motion-safe:animate-pulse" aria-hidden="true">
      <div className="h-8 w-48 rounded-md bg-subtle" />
      <div className="mt-2 h-4 w-72 max-w-full rounded-md bg-subtle" />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="h-72 rounded-xl bg-subtle" />
        <div className="h-112 rounded-xl bg-subtle" />
      </div>
    </div>
  );
}

export function AdminStudioClient() {
  return (
    <>
      <AuthLoading>
        <AdminSkeleton />
      </AuthLoading>
      <Authenticated>
        <AdminStudioAuthenticated />
      </Authenticated>
    </>
  );
}

function AdminStudioAuthenticated() {
  const courses = useQuery(api.courses.listAllAdmin);
  const [selectedCourseId, setSelectedCourseId] =
    useState<Id<"courses"> | null>(null);

  const activeCourseId = selectedCourseId ?? courses?.[0]?._id ?? null;
  const courseDetail = useQuery(
    api.courses.getCourseAdmin,
    activeCourseId ? { courseId: activeCourseId } : "skip",
  );

  const createCourse = useMutation(api.courses.createCourse);
  const updateCourse = useMutation(api.courses.updateCourse);
  const deleteCourse = useMutation(api.courses.deleteCourse);
  const createModule = useMutation(api.courses.createModule);
  const updateModule = useMutation(api.courses.updateModule);
  const deleteModule = useMutation(api.courses.deleteModule);
  const deleteLesson = useMutation(api.courses.deleteLesson);
  const seedSampleCourses = useMutation(api.seed.seedSampleCoursesAdmin);

  const [seeding, setSeeding] = useState(false);
  const [newCourseOpen, setNewCourseOpen] = useState(false);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Doc<"modules"> | null>(
    null,
  );
  const [modTitle, setModTitle] = useState("");
  const [modDescription, setModDescription] = useState("");
  const [savingModule, setSavingModule] = useState(false);

  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [lessonEditorModule, setLessonEditorModule] = useState<{
    id: Id<"modules">;
    title: string;
  } | null>(null);
  const [editingLesson, setEditingLesson] = useState<Doc<"lessons"> | null>(
    null,
  );

  const [confirmDelete, setConfirmDelete] = useState<ConfirmDeleteState | null>(
    null,
  );
  const [deleting, setDeleting] = useState(false);

  async function handleSeedCourses() {
    setSeeding(true);
    try {
      const result = await seedSampleCourses({});
      if (result.createdCourses === 0) {
        toast.info("The sample courses are already here.");
      } else {
        toast.success(
          `Added ${plural(result.createdCourses, "course")}, ${plural(result.createdModules, "module")} and ${plural(result.createdLessons, "lesson")}.`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't add the sample courses. Try again.",
      );
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreateCourse(args: CourseArgs) {
    const id = await createCourse({
      ...args,
      subtitle: args.subtitle || "Hands-on production engineering course.",
      description:
        args.description ||
        "Step-by-step video lessons, code walkthroughs, and quizzes.",
      category: args.category || "Full-Stack Engineering",
    });
    setSelectedCourseId(id);
    setNewCourseOpen(false);
    toast.success(`Created "${args.title}".`);
  }

  function openLessonEditor(mod: Doc<"modules">, lesson: Doc<"lessons"> | null) {
    setEditingLesson(lesson);
    setLessonEditorModule({ id: mod._id, title: mod.title });
    setLessonEditorOpen(true);
  }

  function openModuleDialog(mod: Doc<"modules"> | null) {
    setEditingModule(mod);
    setModTitle(mod?.title ?? "");
    setModDescription(mod?.description ?? "");
    setModuleDialogOpen(true);
  }

  async function handleSaveModule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseDetail) return;

    const cleanTitle = modTitle.trim();
    if (!cleanTitle) {
      toast.error("Add a module title to save.");
      return;
    }

    setSavingModule(true);
    try {
      if (editingModule) {
        await updateModule({
          moduleId: editingModule._id,
          title: cleanTitle,
          description: modDescription.trim(),
        });
        toast.success("Module saved.");
      } else {
        await createModule({
          courseId: courseDetail._id,
          title: cleanTitle,
          description: modDescription.trim(),
        });
        toast.success("Module added.");
      }
      setModuleDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't save the module. Try again.",
      );
    } finally {
      setSavingModule(false);
    }
  }

  async function handleConfirmDelete() {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      if (confirmDelete.kind === "course") {
        await deleteCourse({
          courseId: confirmDelete.id as Id<"courses">,
        });
        if (selectedCourseId === confirmDelete.id) {
          setSelectedCourseId(null);
        }
      } else if (confirmDelete.kind === "module") {
        await deleteModule({
          moduleId: confirmDelete.id as Id<"modules">,
        });
      } else {
        await deleteLesson({
          lessonId: confirmDelete.id as Id<"lessons">,
        });
      }
      toast.success(`Deleted "${confirmDelete.label}".`);
      setConfirmDelete(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't delete it. Try again.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const publishedCourses = courses?.filter((c) => c.published).length ?? 0;
  const totalLessonsCount =
    courses?.reduce((sum, c) => sum + c.lessonCount, 0) ?? 0;
  const detailLessonCount =
    courseDetail?.modules.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Admin studio</h1>
          <p className="mt-1 text-sm text-mist">
            {courses === undefined
              ? "Loading courses…"
              : `${plural(courses.length, "course")}, ${publishedCourses} published, ${plural(totalLessonsCount, "lesson")} in total.`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/courses" className="btn btn-ghost">
            View catalog
          </Link>
          <button
            type="button"
            onClick={() => setNewCourseOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New course
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="Courses" className="card p-2 lg:sticky lg:top-6">
          <h2 className="px-2 pt-1 pb-2 text-sm font-semibold">Courses</h2>
          {courses === undefined ? (
            <div className="space-y-1 motion-safe:animate-pulse" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-md bg-subtle" />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <p className="px-2 pb-2 text-sm text-mist">
              No courses yet. Create one, or add the sample courses to explore
              the studio.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {courses.map((course) => {
                const isSelected = activeCourseId === course._id;
                return (
                  <li key={course._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedCourseId(course._id)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`w-full cursor-pointer rounded-md px-2.5 py-2 text-left transition-colors duration-150 ${
                        isSelected ? "bg-subtle" : "hover:bg-subtle/60"
                      }`}
                    >
                      <span className="line-clamp-2 text-sm font-medium">
                        {course.title}
                      </span>
                      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-mist">
                        <StatusDot published={course.published} />
                        {course.published ? "Published" : "Draft"}
                        {course.tier === "pro" && (
                          <span className="font-medium text-ink">Pro</span>
                        )}
                        <span className="ml-auto tabular-nums">
                          {plural(course.lessonCount, "lesson")}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <div className="mt-2 border-t border-line pt-2">
            <button
              type="button"
              onClick={handleSeedCourses}
              disabled={seeding}
              className="btn btn-ghost btn-sm w-full justify-start text-mist"
            >
              {seeding && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              )}
              Seed sample courses
            </button>
          </div>
        </nav>

        <section aria-label="Course editor" className="min-w-0">
          {!activeCourseId ? (
            <div className="card flex min-h-80 flex-col items-center justify-center p-10 text-center">
              <h2 className="text-lg font-bold">Create your first course</h2>
              <p className="mt-1 max-w-sm text-sm text-mist">
                A course holds modules, and modules hold lessons with video,
                notes and a quiz.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewCourseOpen(true)}
                  className="btn btn-primary"
                >
                  New course
                </button>
                <button
                  type="button"
                  onClick={handleSeedCourses}
                  disabled={seeding}
                  className="btn btn-secondary"
                >
                  Seed sample courses
                </button>
              </div>
            </div>
          ) : courseDetail === undefined ? (
            <div className="card h-112 motion-safe:animate-pulse" aria-hidden="true" />
          ) : courseDetail === null ? (
            <div className="card p-10 text-center text-sm text-mist">
              This course no longer exists. Pick another one from the list.
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 px-5 pt-5 pb-4">
                <div className="min-w-0">
                  <h2 className="text-xl font-bold">{courseDetail.title}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="chip">
                      <StatusDot published={courseDetail.published} />
                      {courseDetail.published ? "Published" : "Draft"}
                    </span>
                    <span className="chip">
                      {courseDetail.tier === "pro" ? "Pro" : "Free"}
                    </span>
                    <span className="truncate font-mono text-xs text-mist">
                      /courses/{courseDetail.slug}
                    </span>
                  </div>
                </div>
                <Link
                  href={`/courses/${courseDetail.slug}`}
                  className="btn btn-secondary btn-sm"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview
                </Link>
              </div>

              <Tabs defaultValue="curriculum">
                <TabsList aria-label="Course sections" className={TAB_LIST_CLASS}>
                  <TabsTab value="curriculum" className={TAB_CLASS}>
                    Curriculum
                  </TabsTab>
                  <TabsTab value="settings" className={TAB_CLASS}>
                    Settings
                  </TabsTab>
                </TabsList>

                <TabsPanel value="curriculum" className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-mist">
                      {plural(courseDetail.modules.length, "module")},{" "}
                      {plural(detailLessonCount, "lesson")}
                    </p>
                    <button
                      type="button"
                      onClick={() => openModuleDialog(null)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add module
                    </button>
                  </div>

                  {courseDetail.modules.length === 0 ? (
                    <div className="rounded-md border border-dashed border-line px-6 py-10 text-center">
                      <p className="text-sm font-medium">No modules yet</p>
                      <p className="mt-1 text-sm text-mist">
                        Add a module, then add lessons to it.
                      </p>
                    </div>
                  ) : (
                    courseDetail.modules.map((mod) => (
                      <section
                        key={mod._id}
                        aria-label={mod.title}
                        className="rounded-md border border-line"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-line bg-subtle/50 px-4 py-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold">{mod.title}</h3>
                            {mod.description && (
                              <p className="mt-0.5 text-sm text-mist">
                                {mod.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openLessonEditor(mod, null)}
                              className="btn btn-ghost btn-sm"
                            >
                              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                              Add lesson
                            </button>
                            <button
                              type="button"
                              onClick={() => openModuleDialog(mod)}
                              aria-label={`Edit module ${mod.title}`}
                              className="btn btn-ghost btn-sm btn-icon w-8"
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setConfirmDelete({
                                  kind: "module",
                                  id: mod._id,
                                  label: mod.title,
                                })
                              }
                              aria-label={`Delete module ${mod.title}`}
                              className="btn btn-ghost btn-sm btn-icon w-8 text-danger"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        {mod.lessons.length === 0 ? (
                          <p className="px-4 py-4 text-sm text-mist">
                            No lessons in this module yet.
                          </p>
                        ) : (
                          <ul className="divide-y divide-line">
                            {mod.lessons.map((lesson) => (
                              <li
                                key={lesson._id}
                                className="flex items-center justify-between gap-3 px-4 py-2.5"
                              >
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">
                                    {lesson.title}
                                  </p>
                                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist">
                                    <VideoStatus
                                      status={lesson.muxStatus}
                                      hasPlaybackId={Boolean(lesson.muxPlaybackId)}
                                    />
                                    <span>
                                      {plural(lesson.quiz?.length ?? 0, "question")}
                                    </span>
                                    <span className="tabular-nums">
                                      {formatDuration(lesson.durationSeconds)}
                                    </span>
                                    {lesson.isFreePreview && (
                                      <span className="font-medium text-ink">
                                        Free preview
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => openLessonEditor(mod, lesson)}
                                    aria-label={`Edit lesson ${lesson.title}`}
                                    className="btn btn-ghost btn-sm"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setConfirmDelete({
                                        kind: "lesson",
                                        id: lesson._id,
                                        label: lesson.title,
                                      })
                                    }
                                    aria-label={`Delete lesson ${lesson.title}`}
                                    className="btn btn-ghost btn-sm btn-icon w-8 text-danger"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    ))
                  )}
                </TabsPanel>

                <TabsPanel value="settings">
                  <CourseForm
                    key={`${courseDetail._id}-${courseDetail.updatedAt}`}
                    initial={valuesFromCourse(courseDetail)}
                    isNew={false}
                    submitLabel="Save course"
                    bodyClassName="p-5"
                    footerClassName="border-t border-line px-5 py-4"
                    onSubmit={async (args) => {
                      await updateCourse({ courseId: courseDetail._id, ...args });
                      toast.success("Course saved.");
                    }}
                    footerStart={
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDelete({
                            kind: "course",
                            id: courseDetail._id,
                            label: courseDetail.title,
                          })
                        }
                        className="btn btn-ghost text-danger"
                      >
                        Delete course
                      </button>
                    }
                  />
                </TabsPanel>
              </Tabs>
            </div>
          )}
        </section>
      </div>

      <StudioDialog
        open={newCourseOpen}
        onOpenChange={setNewCourseOpen}
        title="New course"
        description="Save it as a draft, or publish it to the catalog right away."
        className="max-w-2xl"
      >
        <CourseForm
          initial={NEW_COURSE}
          isNew
          submitLabel="Create course"
          onSubmit={handleCreateCourse}
          bodyClassName="min-h-0 flex-1 overflow-y-auto px-5 py-5"
          footerClassName={DIALOG_FOOTER_CLASS}
          footerEnd={<DialogClose className="btn btn-secondary">Cancel</DialogClose>}
        />
      </StudioDialog>

      {courseDetail && (
        <LessonEditorDialog
          open={lessonEditorOpen}
          onOpenChange={setLessonEditorOpen}
          courseId={courseDetail._id}
          moduleId={lessonEditorModule?.id ?? null}
          moduleTitle={lessonEditorModule?.title}
          lesson={editingLesson}
        />
      )}

      <StudioDialog
        open={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        title={editingModule ? "Edit module" : "Add module"}
        description="A module groups related lessons."
      >
        <form onSubmit={handleSaveModule}>
          <div className="space-y-4 px-5 py-5">
            <TextField
              label="Title"
              required
              value={modTitle}
              onChange={setModTitle}
              placeholder="Foundations"
            />
            <TextField
              label="Description"
              rows={3}
              value={modDescription}
              onChange={setModDescription}
              placeholder="What learners cover in this module."
            />
          </div>
          <div className={DIALOG_FOOTER_CLASS}>
            <DialogClose className="btn btn-secondary">Cancel</DialogClose>
            <button type="submit" disabled={savingModule} className="btn btn-primary">
              {savingModule && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              )}
              {editingModule ? "Save module" : "Add module"}
            </button>
          </div>
        </form>
      </StudioDialog>

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmDelete(null);
        }}
      >
        <AlertDialogBackdrop className="fixed inset-0 z-50 bg-night/60 transition-opacity duration-200 ease-(--ease-out) data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <AlertDialogContent className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-line bg-surface p-5 text-ink shadow-card transition-[opacity,scale] duration-200 ease-(--ease-out) data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-opacity">
          <AlertDialogTitle className="text-lg font-bold">
            Delete this {confirmDelete?.kind}?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-1.5 text-sm text-mist">
            <span className="font-medium text-ink">{confirmDelete?.label}</span>
            {confirmDelete?.kind === "course"
              ? " and all of its modules, lessons and enrollments will be deleted"
              : confirmDelete?.kind === "module"
                ? " and every lesson in it will be deleted"
                : " will be deleted"}
            . You can&apos;t undo this.
          </AlertDialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogClose className="btn btn-secondary">Cancel</AlertDialogClose>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="btn bg-danger text-on-primary"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              Delete {confirmDelete?.kind}
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
