"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  Authenticated,
  AuthLoading,
  useMutation,
  useQuery,
} from "convex/react";
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@ui-sdk/react/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectTrigger,
  SelectValue,
} from "@ui-sdk/react/select";
import { Switch, SwitchThumb } from "@ui-sdk/react/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs";
import { toast } from "@ui-sdk/react/toast";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronDown,
  Crown,
  Database,
  ExternalLink,
  Eye,
  Film,
  FolderPlus,
  HelpCircle,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Save,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { LessonEditorDialog } from "./LessonEditorDialog";

type CourseLevel = "beginner" | "intermediate" | "advanced";
type CourseTier = "free" | "pro";

const LEVEL_OPTIONS: Array<{ value: CourseLevel; label: string }> = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const TIER_OPTIONS: Array<{ value: CourseTier; label: string }> = [
  { value: "free", label: "Free Course" },
  { value: "pro", label: "Pro Course" },
];

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function MuxStatusBadge({
  status,
  hasPlaybackId,
}: {
  status: "idle" | "waiting" | "ready" | "errored";
  hasPlaybackId: boolean;
}) {
  if (hasPlaybackId && status !== "errored") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/50 dark:text-emerald-300">
        <Film className="h-3 w-3" aria-hidden="true" />
        Mux Ready
      </span>
    );
  }
  if (status === "waiting") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/50 dark:text-amber-300">
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        Processing
      </span>
    );
  }
  if (status === "errored") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 dark:border-red-900/70 dark:bg-red-950/50 dark:text-red-300">
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        Mux Error
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
      <Film className="h-3 w-3" aria-hidden="true" />
      No Video
    </span>
  );
}

interface ConfirmDeleteState {
  kind: "course" | "module" | "lesson";
  id: string;
  label: string;
}

function CourseSettingsForm({
  course,
  onRequestDelete,
}: {
  course: Doc<"courses">;
  onRequestDelete: () => void;
}) {
  const formPrefix = useId();
  const updateCourse = useMutation(api.courses.updateCourse);

  const [editTitle, setEditTitle] = useState(course.title);
  const [editSlug, setEditSlug] = useState(course.slug);
  const [editSubtitle, setEditSubtitle] = useState(course.subtitle);
  const [editDescription, setEditDescription] = useState(course.description);
  const [editThumbnailUrl, setEditThumbnailUrl] = useState(course.thumbnailUrl);
  const [editCategory, setEditCategory] = useState(course.category);
  const [editLevel, setEditLevel] = useState<CourseLevel>(course.level);
  const [editTier, setEditTier] = useState<CourseTier>(course.tier);
  const [editPublished, setEditPublished] = useState(course.published);
  const [editFeatured, setEditFeatured] = useState(course.featured);
  const [editEstimatedHours, setEditEstimatedHours] = useState(
    String(course.estimatedHours),
  );
  const [editTagsText, setEditTagsText] = useState(course.tags.join(", "));
  const [savingSettings, setSavingSettings] = useState(false);

  async function handleSaveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = editTitle.trim();
    const cleanSlug = slugify(editSlug || editTitle);
    if (!cleanTitle || !cleanSlug) {
      toast.error("Course title and slug are required.");
      return;
    }

    setSavingSettings(true);
    try {
      const tags = editTagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      await updateCourse({
        courseId: course._id,
        title: cleanTitle,
        slug: cleanSlug,
        subtitle: editSubtitle.trim(),
        description: editDescription.trim(),
        thumbnailUrl: editThumbnailUrl.trim() || DEFAULT_THUMBNAIL,
        category: editCategory.trim(),
        level: editLevel,
        tier: editTier,
        published: editPublished,
        featured: editFeatured,
        estimatedHours: Math.max(
          1,
          Number.parseFloat(editEstimatedHours || "1") || 1,
        ),
        tags,
      });
      toast.success("Course settings saved.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update course.",
      );
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <form onSubmit={handleSaveSettings} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor={`${formPrefix}-edit-title`}
            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Title
          </label>
          <input
            id={`${formPrefix}-edit-title`}
            type="text"
            required
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        <div>
          <label
            htmlFor={`${formPrefix}-edit-slug`}
            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Slug
          </label>
          <input
            id={`${formPrefix}-edit-slug`}
            type="text"
            required
            value={editSlug}
            onChange={(e) => setEditSlug(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-xs text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formPrefix}-edit-subtitle`}
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
        >
          Subtitle
        </label>
        <input
          id={`${formPrefix}-edit-subtitle`}
          type="text"
          value={editSubtitle}
          onChange={(e) => setEditSubtitle(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div>
        <label
          htmlFor={`${formPrefix}-edit-description`}
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
        >
          Description
        </label>
        <textarea
          id={`${formPrefix}-edit-description`}
          rows={4}
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label
            htmlFor={`${formPrefix}-edit-thumb`}
            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Thumbnail URL
          </label>
          <input
            id={`${formPrefix}-edit-thumb`}
            type="url"
            value={editThumbnailUrl}
            onChange={(e) => setEditThumbnailUrl(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-xs text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
        {editThumbnailUrl.trim() && (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={editThumbnailUrl}
              alt="Course thumbnail preview"
              className="h-20 w-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div>
          <label
            htmlFor={`${formPrefix}-edit-category`}
            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Category
          </label>
          <input
            id={`${formPrefix}-edit-category`}
            type="text"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Level
          </span>
          <Select
            items={LEVEL_OPTIONS}
            value={editLevel}
            onValueChange={(val) => {
              if (val) setEditLevel(val as CourseLevel);
            }}
          >
            <SelectTrigger
              aria-label="Course level"
              className="mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <SelectValue />
              <ChevronDown
                className="h-4 w-4 text-zinc-400"
                aria-hidden="true"
              />
            </SelectTrigger>
            <SelectContent className="z-50 min-w-(--anchor-width) rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {LEVEL_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-zinc-800 outline-none data-highlighted:bg-zinc-100 dark:text-zinc-200 dark:data-highlighted:bg-zinc-800"
                >
                  {opt.label}
                  <SelectItemIndicator>
                    <Check
                      className="h-3.5 w-3.5 text-indigo-600"
                      aria-hidden="true"
                    />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
            Tier
          </span>
          <Select
            items={TIER_OPTIONS}
            value={editTier}
            onValueChange={(val) => {
              if (val) setEditTier(val as CourseTier);
            }}
          >
            <SelectTrigger
              aria-label="Course tier"
              className="mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
            >
              <SelectValue />
              <ChevronDown
                className="h-4 w-4 text-zinc-400"
                aria-hidden="true"
              />
            </SelectTrigger>
            <SelectContent className="z-50 min-w-(--anchor-width) rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
              {TIER_OPTIONS.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-zinc-800 outline-none data-highlighted:bg-zinc-100 dark:text-zinc-200 dark:data-highlighted:bg-zinc-800"
                >
                  {opt.label}
                  <SelectItemIndicator>
                    <Check
                      className="h-3.5 w-3.5 text-indigo-600"
                      aria-hidden="true"
                    />
                  </SelectItemIndicator>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label
            htmlFor={`${formPrefix}-edit-hours`}
            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
          >
            Est. Hours
          </label>
          <input
            id={`${formPrefix}-edit-hours`}
            type="number"
            min={1}
            step={0.5}
            value={editEstimatedHours}
            onChange={(e) => setEditEstimatedHours(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor={`${formPrefix}-edit-tags`}
          className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
        >
          Tags (comma-separated)
        </label>
        <input
          id={`${formPrefix}-edit-tags`}
          type="text"
          value={editTagsText}
          onChange={(e) => setEditTagsText(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div>
            <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              Published
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Make this course visible in the public catalog.
            </p>
          </div>
          <Switch
            checked={editPublished}
            onCheckedChange={(checked) => setEditPublished(checked)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 data-checked:bg-emerald-600 data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700"
          >
            <SwitchThumb className="block h-5 w-5 rounded-full bg-white shadow-xs transition-transform data-checked:translate-x-5.5 data-unchecked:translate-x-0.5" />
          </Switch>
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
          <div>
            <div className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
              Featured
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Highlight this course on the homepage showcase.
            </p>
          </div>
          <Switch
            checked={editFeatured}
            onCheckedChange={(checked) => setEditFeatured(checked)}
            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 data-checked:bg-indigo-600 data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700"
          >
            <SwitchThumb className="block h-5 w-5 rounded-full bg-white shadow-xs transition-transform data-checked:translate-x-5.5 data-unchecked:translate-x-0.5" />
          </Switch>
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
        <button
          type="button"
          onClick={onRequestDelete}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-400 dark:hover:bg-red-950/70"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Delete Course
        </button>

        <button
          type="submit"
          disabled={savingSettings}
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {savingSettings ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          Save Settings
        </button>
      </div>
    </form>
  );
}

export function AdminStudioClient() {
  return (
    <>
      <AuthLoading>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-20 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="h-[480px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-4 dark:bg-zinc-900" />
            <div className="h-[480px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-8 dark:bg-zinc-900" />
          </div>
        </div>
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
  const deleteCourse = useMutation(api.courses.deleteCourse);
  const createModule = useMutation(api.courses.createModule);
  const updateModule = useMutation(api.courses.updateModule);
  const deleteModule = useMutation(api.courses.deleteModule);
  const deleteLesson = useMutation(api.courses.deleteLesson);
  const seedSampleCourses = useMutation(api.seed.seedSampleCoursesAdmin);

  const [seeding, setSeeding] = useState(false);

  const [newCourseOpen, setNewCourseOpen] = useState(false);
  const [ncTitle, setNcTitle] = useState("");
  const [ncSlug, setNcSlug] = useState("");
  const [ncSlugTouched, setNcSlugTouched] = useState(false);
  const [ncSubtitle, setNcSubtitle] = useState("");
  const [ncDescription, setNcDescription] = useState("");
  const [ncThumbnailUrl, setNcThumbnailUrl] = useState(DEFAULT_THUMBNAIL);
  const [ncCategory, setNcCategory] = useState("Full-Stack Engineering");
  const [ncLevel, setNcLevel] = useState<CourseLevel>("intermediate");
  const [ncTier, setNcTier] = useState<CourseTier>("pro");
  const [ncHours, setNcHours] = useState("6");
  const [ncTags, setNcTags] = useState("Next.js 16, React 19, TypeScript");
  const [ncPublished, setNcPublished] = useState(false);
  const [ncFeatured, setNcFeatured] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);

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

  const formPrefix = useId();

  async function handleSeedCourses() {
    setSeeding(true);
    try {
      const result = await seedSampleCourses({});
      if (result.createdCourses === 0) {
        toast.info("Sample courses are already seeded.");
      } else {
        toast.success(
          `Seeded ${result.createdCourses} courses, ${result.createdModules} modules, and ${result.createdLessons} lessons.`,
        );
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to seed sample courses.",
      );
    } finally {
      setSeeding(false);
    }
  }

  async function handleCreateCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = ncTitle.trim();
    const slug = slugify(ncSlug || ncTitle);
    if (!title || !slug) {
      toast.error("Please enter a course title and slug.");
      return;
    }

    setCreatingCourse(true);
    try {
      const tags = ncTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const id = await createCourse({
        title,
        slug,
        subtitle: ncSubtitle.trim() || "Hands-on production engineering course.",
        description:
          ncDescription.trim() ||
          "Step-by-step video lessons, code walkthroughs, and quizzes.",
        thumbnailUrl: ncThumbnailUrl.trim() || DEFAULT_THUMBNAIL,
        category: ncCategory.trim() || "Full-Stack Engineering",
        level: ncLevel,
        tier: ncTier,
        published: ncPublished,
        featured: ncFeatured,
        estimatedHours: Math.max(1, Number.parseFloat(ncHours || "1") || 1),
        tags,
      });
      setSelectedCourseId(id);
      setNewCourseOpen(false);
      setNcTitle("");
      setNcSlug("");
      setNcSlugTouched(false);
      setNcSubtitle("");
      setNcDescription("");
      setNcThumbnailUrl(DEFAULT_THUMBNAIL);
      setNcPublished(false);
      setNcFeatured(false);
      toast.success(`Created "${title}".`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not create course.",
      );
    } finally {
      setCreatingCourse(false);
    }
  }

  function openNewModuleDialog() {
    setEditingModule(null);
    setModTitle("");
    setModDescription("");
    setModuleDialogOpen(true);
  }

  function openEditModuleDialog(mod: Doc<"modules">) {
    setEditingModule(mod);
    setModTitle(mod.title);
    setModDescription(mod.description);
    setModuleDialogOpen(true);
  }

  async function handleSaveModule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!courseDetail) return;

    const cleanTitle = modTitle.trim();
    if (!cleanTitle) {
      toast.error("Module title is required.");
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
        toast.success("Module updated.");
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
        error instanceof Error ? error.message : "Could not save module.",
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
        toast.success(`Deleted course "${confirmDelete.label}".`);
      } else if (confirmDelete.kind === "module") {
        await deleteModule({
          moduleId: confirmDelete.id as Id<"modules">,
        });
        toast.success(`Deleted module "${confirmDelete.label}".`);
      } else {
        await deleteLesson({
          lessonId: confirmDelete.id as Id<"lessons">,
        });
        toast.success(`Deleted lesson "${confirmDelete.label}".`);
      }
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  const totalCourses = courses?.length ?? 0;
  const publishedCourses = courses?.filter((c) => c.published).length ?? 0;
  const totalLessonsCount =
    courses?.reduce((sum, c) => sum + c.lessonCount, 0) ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/70 dark:bg-indigo-950/60 dark:text-indigo-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Single-Admin Studio
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl dark:text-zinc-50">
            Course &amp; Curriculum Studio
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create courses, organize modules, upload videos directly to Mux, and
            author Markdown notes &amp; quizzes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden items-center gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-600 sm:flex dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <span>
              <strong className="font-semibold text-zinc-950 dark:text-zinc-50">
                {totalCourses}
              </strong>{" "}
              courses
            </span>
            <span className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <span>
              <strong className="font-semibold text-zinc-950 dark:text-zinc-50">
                {publishedCourses}
              </strong>{" "}
              published
            </span>
            <span className="h-3.5 w-px bg-zinc-200 dark:bg-zinc-700" />
            <span>
              <strong className="font-semibold text-zinc-950 dark:text-zinc-50">
                {totalLessonsCount}
              </strong>{" "}
              lessons
            </span>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            View Catalog
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside
          aria-label="Course catalog sidebar"
          className="space-y-4 lg:col-span-4 xl:col-span-3"
        >
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Courses
              </h2>
              <Dialog
                open={newCourseOpen}
                onOpenChange={(next) => setNewCourseOpen(next)}
              >
                <DialogTrigger className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                  New Course
                </DialogTrigger>
                <DialogBackdrop className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
                <DialogContent className="fixed top-1/2 left-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-[opacity,scale] duration-200 data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-start justify-between gap-3 border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
                    <div>
                      <DialogTitle className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                        Create New Course
                      </DialogTitle>
                      <DialogDescription className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        Start as a draft or publish right away to the catalog.
                      </DialogDescription>
                    </div>
                    <DialogClose
                      aria-label="Close new course dialog"
                      className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </DialogClose>
                  </div>

                  <form
                    onSubmit={handleCreateCourse}
                    className="flex min-h-0 flex-1 flex-col"
                  >
                    <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor={`${formPrefix}-nc-title`}
                            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                          >
                            Course Title
                          </label>
                          <input
                            id={`${formPrefix}-nc-title`}
                            type="text"
                            required
                            value={ncTitle}
                            onChange={(e) => {
                              setNcTitle(e.target.value);
                              if (!ncSlugTouched) {
                                setNcSlug(slugify(e.target.value));
                              }
                            }}
                            placeholder="e.g. Production AI Systems"
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${formPrefix}-nc-slug`}
                            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                          >
                            Slug
                          </label>
                          <input
                            id={`${formPrefix}-nc-slug`}
                            type="text"
                            required
                            value={ncSlug}
                            onChange={(e) => {
                              setNcSlugTouched(true);
                              setNcSlug(e.target.value);
                            }}
                            placeholder="production-ai-systems"
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 font-mono text-xs text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`${formPrefix}-nc-subtitle`}
                          className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                        >
                          Subtitle
                        </label>
                        <input
                          id={`${formPrefix}-nc-subtitle`}
                          type="text"
                          value={ncSubtitle}
                          onChange={(e) => setNcSubtitle(e.target.value)}
                          placeholder="One-sentence value proposition for learners..."
                          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`${formPrefix}-nc-desc`}
                          className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                        >
                          Description
                        </label>
                        <textarea
                          id={`${formPrefix}-nc-desc`}
                          rows={3}
                          value={ncDescription}
                          onChange={(e) => setNcDescription(e.target.value)}
                          placeholder="What learners will build and master..."
                          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <label
                            htmlFor={`${formPrefix}-nc-category`}
                            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                          >
                            Category
                          </label>
                          <input
                            id={`${formPrefix}-nc-category`}
                            type="text"
                            value={ncCategory}
                            onChange={(e) => setNcCategory(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>

                        <div>
                          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                            Level
                          </span>
                          <Select
                            items={LEVEL_OPTIONS}
                            value={ncLevel}
                            onValueChange={(val) => {
                              if (val) setNcLevel(val as CourseLevel);
                            }}
                          >
                            <SelectTrigger
                              aria-label="New course level"
                              className="mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                            >
                              <SelectValue />
                              <ChevronDown
                                className="h-4 w-4 text-zinc-400"
                                aria-hidden="true"
                              />
                            </SelectTrigger>
                            <SelectContent className="z-50 min-w-(--anchor-width) rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                              {LEVEL_OPTIONS.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-zinc-800 outline-none data-highlighted:bg-zinc-100 dark:text-zinc-200 dark:data-highlighted:bg-zinc-800"
                                >
                                  {opt.label}
                                  <SelectItemIndicator>
                                    <Check
                                      className="h-3.5 w-3.5 text-indigo-600"
                                      aria-hidden="true"
                                    />
                                  </SelectItemIndicator>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <span className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                            Access Tier
                          </span>
                          <Select
                            items={TIER_OPTIONS}
                            value={ncTier}
                            onValueChange={(val) => {
                              if (val) setNcTier(val as CourseTier);
                            }}
                          >
                            <SelectTrigger
                              aria-label="New course tier"
                              className="mt-1.5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                            >
                              <SelectValue />
                              <ChevronDown
                                className="h-4 w-4 text-zinc-400"
                                aria-hidden="true"
                              />
                            </SelectTrigger>
                            <SelectContent className="z-50 min-w-(--anchor-width) rounded-xl border border-zinc-200 bg-white p-1 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                              {TIER_OPTIONS.map((opt) => (
                                <SelectItem
                                  key={opt.value}
                                  value={opt.value}
                                  className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm text-zinc-800 outline-none data-highlighted:bg-zinc-100 dark:text-zinc-200 dark:data-highlighted:bg-zinc-800"
                                >
                                  {opt.label}
                                  <SelectItemIndicator>
                                    <Check
                                      className="h-3.5 w-3.5 text-indigo-600"
                                      aria-hidden="true"
                                    />
                                  </SelectItemIndicator>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`${formPrefix}-nc-thumb`}
                            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                          >
                            Thumbnail URL
                          </label>
                          <input
                            id={`${formPrefix}-nc-thumb`}
                            type="url"
                            value={ncThumbnailUrl}
                            onChange={(e) => setNcThumbnailUrl(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor={`${formPrefix}-nc-hours`}
                            className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                          >
                            Est. Hours
                          </label>
                          <input
                            id={`${formPrefix}-nc-hours`}
                            type="number"
                            min={1}
                            step={0.5}
                            value={ncHours}
                            onChange={(e) => setNcHours(e.target.value)}
                            className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor={`${formPrefix}-nc-tags`}
                          className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
                        >
                          Tags (comma-separated)
                        </label>
                        <input
                          id={`${formPrefix}-nc-tags`}
                          type="text"
                          value={ncTags}
                          onChange={(e) => setNcTags(e.target.value)}
                          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-3.5 py-2.5 dark:border-zinc-800">
                          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            Publish immediately
                          </span>
                          <Switch
                            checked={ncPublished}
                            onCheckedChange={(checked) =>
                              setNcPublished(checked)
                            }
                            className="relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors data-checked:bg-emerald-600 data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700"
                          >
                            <SwitchThumb className="block h-4.5 w-4.5 rounded-full bg-white shadow-xs transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0.5" />
                          </Switch>
                        </label>

                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-zinc-200 px-3.5 py-2.5 dark:border-zinc-800">
                          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            Feature on landing page
                          </span>
                          <Switch
                            checked={ncFeatured}
                            onCheckedChange={(checked) =>
                              setNcFeatured(checked)
                            }
                            className="relative inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors data-checked:bg-indigo-600 data-unchecked:bg-zinc-300 dark:data-unchecked:bg-zinc-700"
                          >
                            <SwitchThumb className="block h-4.5 w-4.5 rounded-full bg-white shadow-xs transition-transform data-checked:translate-x-5 data-unchecked:translate-x-0.5" />
                          </Switch>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 border-t border-zinc-200 bg-zinc-50/70 px-6 py-4 dark:border-zinc-800 dark:bg-zinc-900/50">
                      <DialogClose className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                        Cancel
                      </DialogClose>
                      <button
                        type="submit"
                        disabled={creatingCourse}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                      >
                        {creatingCourse && (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            aria-hidden="true"
                          />
                        )}
                        Create Course
                      </button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="mt-3 space-y-2">
              {courses === undefined ? (
                Array.from({ length: 3 }, (_, idx) => (
                  <div
                    key={`course-skeleton-${idx}`}
                    className="h-20 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
                  />
                ))
              ) : courses.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 px-4 py-8 text-center dark:border-zinc-800">
                  <BookOpen
                    className="mx-auto h-6 w-6 text-zinc-400"
                    aria-hidden="true"
                  />
                  <p className="mt-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    No courses yet
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    Create your first course or seed the sample catalog below.
                  </p>
                </div>
              ) : (
                courses.map((course) => {
                  const isSelected = activeCourseId === course._id;
                  return (
                    <button
                      key={course._id}
                      type="button"
                      onClick={() => setSelectedCourseId(course._id)}
                      aria-current={isSelected ? "true" : undefined}
                      className={`w-full cursor-pointer rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50/60 shadow-xs dark:border-indigo-500/80 dark:bg-indigo-950/30"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                          {course.title}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {course.tier === "pro" ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300">
                            <Crown className="h-2.5 w-2.5" aria-hidden="true" />
                            Pro
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                            Free
                          </span>
                        )}

                        {course.published ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-medium text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                            Draft
                          </span>
                        )}

                        <span className="ml-auto text-[11px] text-zinc-500 dark:text-zinc-400">
                          {course.moduleCount}m · {course.lessonCount}l
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleSeedCourses}
                disabled={seeding}
                className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {seeding ? (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Database className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                Seed Sample Courses
              </button>
            </div>
          </div>
        </aside>

        <section
          aria-label="Selected course workspace"
          className="lg:col-span-8 xl:col-span-9"
        >
          {!activeCourseId ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <Sparkles
                className="h-9 w-9 text-indigo-500"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                Select or Create a Course
              </h2>
              <p className="mt-1 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Choose a course on the left to manage its curriculum, Mux
                videos, Markdown notes, and interactive quizzes — or seed the
                sample courses to explore right away.
              </p>
            </div>
          ) : courseDetail === undefined ? (
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="h-8 w-2/3 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-10 w-56 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-64 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ) : courseDetail === null ? (
            <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900/60">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                This course could not be found. Select another course from the
                sidebar.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                      {courseDetail.title}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        courseDetail.tier === "pro"
                          ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300"
                      }`}
                    >
                      {courseDetail.tier === "pro" ? "Pro" : "Free"}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        courseDetail.published
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                    >
                      {courseDetail.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
                    /courses/{courseDetail.slug}
                  </p>
                </div>

                <Link
                  href={`/courses/${courseDetail.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  Preview Course
                </Link>
              </div>

              <Tabs defaultValue="curriculum">
                <div className="border-b border-zinc-200 bg-zinc-50/70 px-6 dark:border-zinc-800 dark:bg-zinc-950/40">
                  <TabsList
                    aria-label="Course management sections"
                    className="flex gap-2 py-2.5"
                  >
                    <TabsTab
                      value="settings"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-950 data-selected:bg-zinc-950 data-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:data-selected:bg-white dark:data-selected:text-zinc-950"
                    >
                      <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                      Settings
                    </TabsTab>
                    <TabsTab
                      value="curriculum"
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-200/70 hover:text-zinc-950 data-selected:bg-zinc-950 data-selected:text-white dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100 dark:data-selected:bg-white dark:data-selected:text-zinc-950"
                    >
                      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                      Curriculum ({courseDetail.modules.length} modules)
                    </TabsTab>
                  </TabsList>
                </div>

                <TabsPanel value="settings" className="p-6">
                  <CourseSettingsForm
                    key={`${courseDetail._id}-${courseDetail.updatedAt}`}
                    course={courseDetail}
                    onRequestDelete={() =>
                      setConfirmDelete({
                        kind: "course",
                        id: courseDetail._id,
                        label: courseDetail.title,
                      })
                    }
                  />
                </TabsPanel>

                <TabsPanel value="curriculum" className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                        Modules &amp; Lessons
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Organize lessons into modules and configure video,
                        notes, previews, and quizzes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={openNewModuleDialog}
                      className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
                    >
                      <FolderPlus className="h-3.5 w-3.5" aria-hidden="true" />
                      Add Module
                    </button>
                  </div>

                  {courseDetail.modules.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center dark:border-zinc-800">
                      <Layers
                        className="mx-auto h-7 w-7 text-zinc-400"
                        aria-hidden="true"
                      />
                      <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        No modules yet
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Add your first module to begin creating video lessons.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {courseDetail.modules.map((mod, modIdx) => (
                        <div
                          key={mod._id}
                          className="overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/40"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 bg-white px-4 py-3.5 dark:border-zinc-800 dark:bg-zinc-900/80">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                                  {modIdx + 1}
                                </span>
                                <h4 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                                  {mod.title}
                                </h4>
                              </div>
                              {mod.description && (
                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                  {mod.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLesson(null);
                                  setLessonEditorModule({
                                    id: mod._id,
                                    title: mod.title,
                                  });
                                  setLessonEditorOpen(true);
                                }}
                                className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-zinc-950 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                              >
                                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                                Add Lesson
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditModuleDialog(mod)}
                                aria-label={`Edit module ${mod.title}`}
                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
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
                                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/50"
                              >
                                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            </div>
                          </div>

                          <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80">
                            {mod.lessons.length === 0 ? (
                              <div className="px-4 py-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                                No lessons in this module yet. Click &ldquo;Add
                                Lesson&rdquo; above.
                              </div>
                            ) : (
                              mod.lessons.map((lesson, lIdx) => (
                                <div
                                  key={lesson._id}
                                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/80 dark:hover:bg-zinc-900/50"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span className="font-mono text-xs text-zinc-400">
                                        {String(lIdx + 1).padStart(2, "0")}
                                      </span>
                                      <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                        {lesson.title}
                                      </span>
                                      {lesson.isFreePreview && (
                                        <span className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/50 dark:text-sky-300">
                                          Free Preview
                                        </span>
                                      )}
                                    </div>
                                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                                      <MuxStatusBadge
                                        status={lesson.muxStatus}
                                        hasPlaybackId={Boolean(
                                          lesson.muxPlaybackId,
                                        )}
                                      />
                                      <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                                        <HelpCircle
                                          className="h-3 w-3"
                                          aria-hidden="true"
                                        />
                                        {lesson.quiz?.length ?? 0} quiz{" "}
                                        {(lesson.quiz?.length ?? 0) === 1
                                          ? "Q"
                                          : "Qs"}
                                      </span>
                                      <span className="font-mono">
                                        {formatDuration(lesson.durationSeconds)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingLesson(lesson);
                                        setLessonEditorModule({
                                          id: mod._id,
                                          title: mod.title,
                                        });
                                        setLessonEditorOpen(true);
                                      }}
                                      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                                    >
                                      <Pencil
                                        className="h-3 w-3"
                                        aria-hidden="true"
                                      />
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
                                      className="inline-flex h-7.5 w-7.5 cursor-pointer items-center justify-center rounded-lg border border-zinc-200 bg-white text-red-600 transition-colors hover:border-red-200 hover:bg-red-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-red-400 dark:hover:border-red-900 dark:hover:bg-red-950/50"
                                    >
                                      <Trash2
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsPanel>
              </Tabs>
            </div>
          )}
        </section>
      </div>

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

      <Dialog
        open={moduleDialogOpen}
        onOpenChange={(next) => setModuleDialogOpen(next)}
      >
        <DialogBackdrop className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <DialogContent className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-[opacity,scale] duration-200 data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                {editingModule ? "Edit Module" : "Add Module"}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                Group related lessons into a structured section.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close module dialog"
              className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </DialogClose>
          </div>

          <form onSubmit={handleSaveModule} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor={`${formPrefix}-mod-title`}
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
              >
                Module Title
              </label>
              <input
                id={`${formPrefix}-mod-title`}
                type="text"
                required
                value={modTitle}
                onChange={(e) => setModTitle(e.target.value)}
                placeholder="e.g. Module 1: Foundations"
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div>
              <label
                htmlFor={`${formPrefix}-mod-desc`}
                className="block text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400"
              >
                Description
              </label>
              <textarea
                id={`${formPrefix}-mod-desc`}
                rows={3}
                value={modDescription}
                onChange={(e) => setModDescription(e.target.value)}
                placeholder="What learners cover in this module..."
                className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-950 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <DialogClose className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
                Cancel
              </DialogClose>
              <button
                type="submit"
                disabled={savingModule}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                {savingModule && (
                  <Loader2
                    className="h-3.5 w-3.5 animate-spin"
                    aria-hidden="true"
                  />
                )}
                {editingModule ? "Save Module" : "Add Module"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(next) => {
          if (!next) setConfirmDelete(null);
        }}
      >
        <DialogBackdrop className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs transition-opacity duration-200 data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <DialogContent className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl transition-[opacity,scale] duration-200 data-starting-style:scale-96 data-starting-style:opacity-0 data-ending-style:scale-96 data-ending-style:opacity-0 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                Delete {confirmDelete?.kind}?
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                Permanently remove{" "}
                <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {confirmDelete?.label}
                </strong>
                {confirmDelete?.kind === "course"
                  ? " along with all of its modules, lessons, and enrollments"
                  : confirmDelete?.kind === "module"
                    ? " along with all lessons inside it"
                    : ""}
                . This action cannot be undone.
              </DialogDescription>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <DialogClose className="cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-500 disabled:opacity-60"
            >
              {deleting && (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
              )}
              Delete
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
