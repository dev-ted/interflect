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
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
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
  Search,
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
  TextField,
  slugify,
} from "./LessonEditorDialog";

type CourseLevel = "beginner" | "intermediate" | "advanced";
type CourseTier = "free" | "pro";
type StatusFilter = "all" | "published" | "draft";

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

// ponytail: globals.css has no .skeleton class yet; swap to it once it lands.
const SKELETON = "rounded-md bg-subtle motion-safe:animate-pulse";

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function plural(count: number, word: string) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function errorText(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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
  category: "UI design",
  level: "intermediate",
  tier: "pro",
  published: false,
  featured: false,
  estimatedHours: "6",
  tags: "UI design, Figma, CSS",
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
      <SelectContent className="z-50 min-w-(--anchor-width) origin-(--transform-origin) rounded-[10px] border border-line bg-surface p-1 text-ink shadow-card transition-[opacity,scale] duration-150 ease-(--ease-out) data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-opacity">
        {items.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className="flex h-9 cursor-pointer items-center justify-between gap-3 rounded-md px-2.5 text-sm outline-none data-highlighted:bg-subtle"
          >
            {opt.label}
            <SelectItemIndicator>
              <Check className="h-3.5 w-3.5 text-accent-ink" aria-hidden="true" />
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
  footerEnd,
  saveBar,
}: {
  initial: CourseValues;
  isNew: boolean;
  submitLabel: string;
  onSubmit: (args: CourseArgs) => Promise<void>;
  bodyClassName?: string;
  footerClassName?: string;
  footerEnd?: ReactNode;
  /** Show a sticky save bar only while there are unsaved changes. */
  saveBar?: boolean;
}) {
  const [values, setValues] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; slug?: string }>({});

  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  function set<K extends keyof CourseValues>(key: K, value: CourseValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function discard() {
    setValues(initial);
    setSlugTouched(!isNew);
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const args = toCourseArgs(values);
    const nextErrors = {
      title: args.title ? undefined : "Add a course title.",
      slug: args.slug ? undefined : "Use letters or numbers in the slug.",
    };
    setErrors(nextErrors);
    if (nextErrors.title || nextErrors.slug) return;

    setSaving(true);
    try {
      await onSubmit(args);
    } catch (error) {
      toast.error(
        errorText(
          error,
          "Couldn't save the course. Check your connection and try again.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  const submitButton = (
    <button type="submit" disabled={saving} className="btn btn-primary">
      {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {submitLabel}
    </button>
  );

  return (
    <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className={`space-y-4 ${bodyClassName ?? ""}`}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label="Title"
            required
            value={values.title}
            error={errors.title}
            onChange={(title) => {
              setErrors((prev) => ({ ...prev, title: undefined }));
              setValues((prev) => ({
                ...prev,
                title,
                slug: slugTouched ? prev.slug : slugify(title),
              }));
            }}
            placeholder="Interface typography"
          />
          <TextField
            label="Slug"
            required
            mono
            value={values.slug}
            error={errors.slug}
            onChange={(slug) => {
              setSlugTouched(true);
              setErrors((prev) => ({ ...prev, slug: undefined }));
              set("slug", slug);
            }}
            placeholder="interface-typography"
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
              className="hidden h-10 w-full rounded-[10px] border border-line object-cover sm:block"
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

      {saveBar ? (
        dirty && (
          <div className="sticky bottom-4 z-10 mx-auto mt-5 flex w-full max-w-xl items-center gap-2 rounded-full border border-line bg-surface py-2 pr-2 pl-5 shadow-card">
            <p className="min-w-0 flex-1 truncate text-sm text-mist">
              Unsaved changes
            </p>
            <button
              type="button"
              onClick={discard}
              disabled={saving}
              className="btn btn-ghost btn-sm"
            >
              Discard
            </button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
              {saving && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              )}
              {submitLabel}
            </button>
          </div>
        )
      ) : (
        <div className={`flex items-center justify-end gap-2 ${footerClassName ?? ""}`}>
          {footerEnd}
          {submitButton}
        </div>
      )}
    </form>
  );
}

/* ── Small bits ─────────────────────────────────────────────────────── */

function VideoChip({
  status,
  hasPlaybackId,
}: {
  status: "idle" | "waiting" | "ready" | "errored";
  hasPlaybackId: boolean;
}) {
  const [dot, label] =
    status === "errored"
      ? ["bg-danger", "Video error"]
      : hasPlaybackId
        ? ["bg-success", "Video ready"]
        : status === "waiting"
          ? ["bg-warning", "Processing"]
          : ["bg-mist/50", "No video"];
  return (
    <span className="chip">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function StatusDot({ published }: { published: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`size-1.5 shrink-0 rounded-full ${published ? "bg-success" : "bg-mist/50"}`}
    />
  );
}

interface ConfirmDeleteState {
  kind: "course" | "module" | "lesson";
  id: string;
  label: string;
}

const KIND_LABEL = { course: "Course", module: "Module", lesson: "Lesson" };

function CourseListSkeleton() {
  return (
    <div className="space-y-1" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="px-4 py-3">
          <div className={`h-4 w-4/5 ${SKELETON}`} />
          <div className={`mt-2 h-3 w-1/2 ${SKELETON}`} />
        </div>
      ))}
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="card p-5">
        <div className={`h-6 w-2/3 ${SKELETON}`} />
        <div className={`mt-3 h-5 w-48 ${SKELETON}`} />
      </div>
      {[0, 1].map((i) => (
        <div key={i} className="card p-5">
          <div className={`h-4 w-40 ${SKELETON}`} />
          {[0, 1, 2].map((j) => (
            <div key={j} className={`mt-4 h-10 ${SKELETON}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div aria-hidden="true">
      <div className={`h-7 w-40 ${SKELETON}`} />
      <div className={`mt-2 h-4 w-72 max-w-full ${SKELETON}`} />
      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="card p-3">
          <div className={`h-10 ${SKELETON}`} />
          <div className={`mt-2 h-8 ${SKELETON}`} />
          <div className="mt-2">
            <CourseListSkeleton />
          </div>
        </div>
        <EditorSkeleton />
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [seeding, setSeeding] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [newCourseOpen, setNewCourseOpen] = useState(false);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Doc<"modules"> | null>(
    null,
  );
  const [modTitle, setModTitle] = useState("");
  const [modDescription, setModDescription] = useState("");
  const [modTitleError, setModTitleError] = useState<string>();
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
      toast.error(errorText(error, "Couldn't add the sample courses. Try again."));
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreateCourse(args: CourseArgs) {
    const id = await createCourse({
      ...args,
      subtitle: args.subtitle || "A hands-on course in interface craft.",
      description:
        args.description ||
        "Step-by-step video lessons, worked examples and quizzes.",
      category: args.category || "UI design",
    });
    setSelectedCourseId(id);
    setNewCourseOpen(false);
    toast.success("Course created");
  }

  async function handleTogglePublish(course: Doc<"courses">) {
    setPublishing(true);
    try {
      await updateCourse({
        courseId: course._id,
        ...toCourseArgs({ ...valuesFromCourse(course), published: !course.published }),
      });
      toast.success(course.published ? "Moved to drafts" : "Course published");
    } catch (error) {
      toast.error(errorText(error, "Couldn't change the course status. Try again."));
    } finally {
      setPublishing(false);
    }
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
    setModTitleError(undefined);
    setModuleDialogOpen(true);
  }

  async function handleSaveModule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseDetail) return;

    const cleanTitle = modTitle.trim();
    if (!cleanTitle) {
      setModTitleError("Add a module title.");
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
        toast.success("Module saved");
      } else {
        await createModule({
          courseId: courseDetail._id,
          title: cleanTitle,
          description: modDescription.trim(),
        });
        toast.success("Module added");
      }
      setModuleDialogOpen(false);
    } catch (error) {
      toast.error(errorText(error, "Couldn't save the module. Try again."));
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
      toast.success(`${KIND_LABEL[confirmDelete.kind]} deleted`);
      setConfirmDelete(null);
    } catch (error) {
      toast.error(errorText(error, "Couldn't delete it. Try again."));
    } finally {
      setDeleting(false);
    }
  }

  const query = search.trim().toLowerCase();
  const visibleCourses = courses?.filter(
    (c) =>
      (statusFilter === "all" ||
        c.published === (statusFilter === "published")) &&
      (!query || c.title.toLowerCase().includes(query)),
  );
  const publishedCourses = courses?.filter((c) => c.published).length ?? 0;
  const totalLessonsCount =
    courses?.reduce((sum, c) => sum + c.lessonCount, 0) ?? 0;
  const detailLessonCount =
    courseDetail?.modules.reduce((sum, m) => sum + m.lessons.length, 0) ?? 0;

  const emptyActions = (
    <div className="mt-5 flex flex-wrap justify-center gap-2">
      <button
        type="button"
        onClick={() => setNewCourseOpen(true)}
        className="btn btn-primary"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        New course
      </button>
      <button
        type="button"
        onClick={handleSeedCourses}
        disabled={seeding}
        className="btn btn-secondary"
      >
        {seeding && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Seed sample courses
      </button>
    </div>
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="sr-only">Courses</h2>
          <p className="text-sm text-mist">
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

      <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[18rem_1fr]">
        <nav aria-label="Course list" className="card p-3 lg:sticky lg:top-6">
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-mist"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses"
              aria-label="Search courses"
              className="field pl-9"
            />
          </div>
          <SegmentedControl
            aria-label="Filter by status"
            value={statusFilter}
            onValueChange={(next) => {
              if (next) setStatusFilter(next as StatusFilter);
            }}
            className="relative isolate mt-2 flex w-full rounded-full bg-subtle p-0.5"
          >
            <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-full bg-surface shadow-sm transition-[left,width] duration-200 ease-(--ease-out) data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
            {(["all", "published", "draft"] as const).map((value) => (
              <SegmentedControlItem
                key={value}
                value={value}
                className="h-7 flex-1 cursor-pointer rounded-full text-xs font-medium text-mist transition-colors duration-150 data-checked:text-ink"
              >
                {value === "all" ? "All" : value === "published" ? "Published" : "Draft"}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>

          <div className="mt-3">
            {visibleCourses === undefined ? (
              <CourseListSkeleton />
            ) : courses?.length === 0 ? (
              <p className="px-2 py-3 text-sm text-mist">No courses yet.</p>
            ) : visibleCourses.length === 0 ? (
              <div className="px-2 py-3 text-sm">
                <p className="text-mist">No courses match.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="btn btn-ghost btn-sm mt-1 -ml-2"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <ul className="max-h-80 space-y-0.5 overflow-y-auto lg:max-h-none">
                {visibleCourses.map((course) => {
                  const isSelected = activeCourseId === course._id;
                  return (
                    <li key={course._id}>
                      <button
                        type="button"
                        onClick={() => setSelectedCourseId(course._id)}
                        aria-current={isSelected ? "true" : undefined}
                        className={`relative w-full cursor-pointer rounded-xl py-2.5 pr-3 pl-4 text-left transition-colors duration-150 ${
                          isSelected
                            ? "bg-subtle before:absolute before:inset-y-2.5 before:left-1.5 before:w-0.5 before:rounded-full before:bg-accent"
                            : "hover:bg-subtle/60"
                        }`}
                      >
                        <span className="line-clamp-2 text-sm font-medium">
                          {course.title}
                        </span>
                        <span className="mt-1 flex items-center gap-1.5 text-xs text-mist">
                          <StatusDot published={course.published} />
                          {course.published ? "Published" : "Draft"}
                          <span className="h-3 w-px bg-line" aria-hidden="true" />
                          <span className="tabular-nums">
                            {plural(course.lessonCount, "lesson")}
                          </span>
                          <span className="ml-auto font-medium">
                            {course.tier === "pro" ? "Pro" : "Free"}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {courses !== undefined && courses.length > 0 && (
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
          )}
        </nav>

        <section aria-label="Course editor" className="min-w-0">
          {courses === undefined ? (
            <EditorSkeleton />
          ) : !activeCourseId ? (
            <div className="card flex min-h-80 flex-col items-center justify-center p-10 text-center">
              <h3 className="text-lg font-bold">No courses yet</h3>
              <p className="mt-1 max-w-sm text-sm text-mist">
                A course holds modules, and modules hold lessons with video,
                notes and a quiz. Start one, or add the sample courses.
              </p>
              {emptyActions}
            </div>
          ) : courseDetail === undefined ? (
            <EditorSkeleton />
          ) : courseDetail === null ? (
            <div className="card p-10 text-center text-sm text-mist">
              This course no longer exists. Pick another one from the list.
            </div>
          ) : (
            <Tabs defaultValue="curriculum" className="space-y-4">
              <div className="card">
                <div className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold tracking-tight text-balance">
                      {courseDetail.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <span className="chip">
                        <StatusDot published={courseDetail.published} />
                        {courseDetail.published ? "Published" : "Draft"}
                      </span>
                      <span className="chip">
                        {courseDetail.tier === "pro" ? "Pro" : "Free"}
                      </span>
                      <span className="chip">
                        {plural(courseDetail.modules.length, "module")}, {plural(detailLessonCount, "lesson")}
                      </span>
                      <span className="truncate font-mono text-xs text-mist">
                        /courses/{courseDetail.slug}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/courses/${courseDetail.slug}`}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      Preview
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(courseDetail)}
                      disabled={publishing}
                      className={`btn btn-sm ${courseDetail.published ? "btn-secondary" : "btn-primary"}`}
                    >
                      {publishing && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      )}
                      {courseDetail.published ? "Unpublish" : "Publish"}
                    </button>
                  </div>
                </div>
                <TabsList
                  aria-label="Course sections"
                  className="flex gap-5 border-t border-line px-5"
                >
                  <TabsTab value="curriculum" className={TAB_CLASS}>
                    Curriculum
                  </TabsTab>
                  <TabsTab value="settings" className={TAB_CLASS}>
                    Settings
                  </TabsTab>
                </TabsList>
              </div>

              <TabsPanel value="curriculum" className="space-y-4">
                {courseDetail.modules.length === 0 ? (
                  <div className="card flex flex-col items-center px-6 py-12 text-center">
                    <p className="text-sm font-semibold">No modules yet</p>
                    <p className="mt-1 text-sm text-mist">
                      Add a module, then add lessons to it.
                    </p>
                    <button
                      type="button"
                      onClick={() => openModuleDialog(null)}
                      className="btn btn-primary btn-sm mt-4"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add module
                    </button>
                  </div>
                ) : (
                  <>
                    {courseDetail.modules.map((mod, modIdx) => (
                      <section
                        key={mod._id}
                        aria-label={mod.title}
                        className="card overflow-hidden"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-mist">
                              Module {modIdx + 1}, {plural(mod.lessons.length, "lesson")}
                            </p>
                            <h4 className="mt-0.5 font-semibold">{mod.title}</h4>
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
                              className="btn btn-secondary btn-sm"
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
                          <p className="border-t border-line px-5 py-4 text-sm text-mist">
                            No lessons in this module yet.
                          </p>
                        ) : (
                          <ul className="divide-y divide-line border-t border-line">
                            {mod.lessons.map((lesson, lessonIdx) => (
                              <li
                                key={lesson._id}
                                className="flex items-start gap-3 px-5 py-3 transition-colors duration-150 hover:bg-subtle/40 sm:items-center"
                              >
                                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-subtle text-xs font-medium text-mist tabular-nums sm:mt-0">
                                  {lessonIdx + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">
                                    {lesson.title}
                                  </p>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                    <VideoChip
                                      status={lesson.muxStatus}
                                      hasPlaybackId={Boolean(lesson.muxPlaybackId)}
                                    />
                                    <span className="chip">
                                      {plural(lesson.quiz?.length ?? 0, "question")}
                                    </span>
                                    <span className="chip tabular-nums">
                                      {formatDuration(lesson.durationSeconds)}
                                    </span>
                                    {lesson.isFreePreview && (
                                      <span className="chip bg-accent/10 text-accent-ink">
                                        Free preview
                                      </span>
                                    )}
                                  </div>
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
                    ))}
                    <button
                      type="button"
                      onClick={() => openModuleDialog(null)}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-dashed border-line px-5 py-4 text-sm font-medium text-mist transition-colors duration-150 hover:border-accent hover:text-ink"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Add module
                    </button>
                  </>
                )}
              </TabsPanel>

              <TabsPanel value="settings" className="space-y-4">
                <div className="card p-5">
                  <CourseForm
                    key={`${courseDetail._id}-${courseDetail.updatedAt}`}
                    initial={valuesFromCourse(courseDetail)}
                    isNew={false}
                    submitLabel="Save"
                    saveBar
                    onSubmit={async (args) => {
                      await updateCourse({ courseId: courseDetail._id, ...args });
                      toast.success("Course saved");
                    }}
                  />
                </div>
                <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <h4 className="text-sm font-semibold">Delete course</h4>
                    <p className="mt-0.5 text-sm text-mist">
                      Removes its modules, lessons and enrollments for good.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmDelete({
                        kind: "course",
                        id: courseDetail._id,
                        label: courseDetail.title,
                      })
                    }
                    className="btn btn-secondary text-danger"
                  >
                    Delete course
                  </button>
                </div>
              </TabsPanel>
            </Tabs>
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
        <form noValidate onSubmit={handleSaveModule}>
          <div className="space-y-4 px-5 py-5">
            <TextField
              label="Title"
              required
              value={modTitle}
              error={modTitleError}
              onChange={(v) => {
                setModTitle(v);
                setModTitleError(undefined);
              }}
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
        <AlertDialogContent className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[14px] border border-line bg-surface p-5 text-ink shadow-card transition-[opacity,scale] duration-200 ease-(--ease-out) data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 motion-reduce:transition-opacity motion-reduce:data-starting-style:scale-100 motion-reduce:data-ending-style:scale-100">
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
