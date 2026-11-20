import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  getOptionalIdentity,
  isAdminIdentity,
  isProIdentity,
  requireAdmin,
} from "./lib/auth";
import { quizQuestionValidator } from "./schema";

export const listPublished = query({
  args: {
    tier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await getOptionalIdentity(ctx);
    const maxCourses = Math.min(args.limit ?? 50, 100);
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_published_and_order", (q) => q.eq("published", true))
      .order("asc")
      .take(maxCourses);

    const filtered = courses.filter((c) => {
      if (args.tier && c.tier !== args.tier) return false;
      if (args.category && c.category !== args.category) return false;
      return true;
    });

    const userEnrollments = identity
      ? await ctx.db
          .query("enrollments")
          .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
          .take(200)
      : [];
    const enrolledIds = new Set(userEnrollments.map((e) => e.courseId));

    const userProgress = identity
      ? await ctx.db
          .query("lessonProgress")
          .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
          .take(1000)
      : [];
    const completedByCourse = new Map<Id<"courses">, number>();
    for (const p of userProgress) {
      if (p.completed) {
        completedByCourse.set(
          p.courseId,
          (completedByCourse.get(p.courseId) ?? 0) + 1,
        );
      }
    }

    return await Promise.all(
      filtered.map(async (course) => {
        const modules = await ctx.db
          .query("modules")
          .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
          .take(100);
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .take(500);
        const freePreviewCount = lessons.filter(
          (l) => course.tier === "free" || l.isFreePreview,
        ).length;
        const totalDurationSeconds = lessons.reduce(
          (acc, l) => acc + l.durationSeconds,
          0,
        );
        const completedLessons = completedByCourse.get(course._id) ?? 0;
        const firstModule = modules[0];
        const firstLesson = firstModule
          ? lessons
              .filter((l) => l.moduleId === firstModule._id)
              .sort((a, b) => a.order - b.order)[0]
          : lessons.sort((a, b) => a.order - b.order)[0];

        return {
          ...course,
          moduleCount: modules.length,
          lessonCount: lessons.length,
          freePreviewCount,
          totalDurationSeconds,
          isEnrolled: enrolledIds.has(course._id),
          completedLessons,
          firstLessonSlug: firstLesson?.slug ?? null,
        };
      }),
    );
  },
});

export const getCourseBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const identity = await getOptionalIdentity(ctx);
    const isAdmin = isAdminIdentity(identity);
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();

    if (!course || (!course.published && !isAdmin)) {
      return null;
    }

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .order("asc")
      .take(100);

    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .take(500);

    const enrollment = identity
      ? await ctx.db
          .query("enrollments")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", identity.tokenIdentifier).eq("courseId", course._id),
          )
          .unique()
      : null;

    const progressRows = identity
      ? await ctx.db
          .query("lessonProgress")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", identity.tokenIdentifier).eq("courseId", course._id),
          )
          .take(500)
      : [];
    const completedSet = new Set(
      progressRows.filter((p) => p.completed).map((p) => p.lessonId),
    );

    const modulesWithLessons = modules.map((mod) => {
      const modLessons = allLessons
        .filter((l) => l.moduleId === mod._id)
        .sort((a, b) => a.order - b.order)
        .map((lesson) => ({
          _id: lesson._id,
          title: lesson.title,
          slug: lesson.slug,
          summary: lesson.summary,
          order: lesson.order,
          isFreePreview: lesson.isFreePreview,
          durationSeconds: lesson.durationSeconds,
          muxStatus: lesson.muxStatus,
          hasVideo: Boolean(lesson.muxPlaybackId),
          quizCount: lesson.quiz?.length ?? 0,
          completed: completedSet.has(lesson._id),
        }));
      return {
        ...mod,
        lessons: modLessons,
      };
    });

    const totalLessons = allLessons.length;
    const completedLessons = allLessons.filter((l) =>
      completedSet.has(l._id),
    ).length;

    return {
      ...course,
      modules: modulesWithLessons,
      isEnrolled: Boolean(enrollment),
      enrolledAt: enrollment?.enrolledAt ?? null,
      totalLessons,
      completedLessons,
      hasProAccess: isProIdentity(identity),
      isAdmin,
    };
  },
});

export const getLessonBySlug = query({
  args: {
    courseSlug: v.string(),
    lessonSlug: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await getOptionalIdentity(ctx);
    const isAdmin = isAdminIdentity(identity);
    const hasProAccess = isProIdentity(identity);

    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.courseSlug))
      .unique();

    if (!course || (!course.published && !isAdmin)) {
      return null;
    }

    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_course_and_slug", (q) =>
        q.eq("courseId", course._id).eq("slug", args.lessonSlug),
      )
      .unique();

    if (!lesson) {
      return null;
    }

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .order("asc")
      .take(100);

    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .take(500);

    const enrollment = identity
      ? await ctx.db
          .query("enrollments")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", identity.tokenIdentifier).eq("courseId", course._id),
          )
          .unique()
      : null;

    const progressRows = identity
      ? await ctx.db
          .query("lessonProgress")
          .withIndex("by_user_and_course", (q) =>
            q.eq("userId", identity.tokenIdentifier).eq("courseId", course._id),
          )
          .take(500)
      : [];
    const completedSet = new Set(
      progressRows.filter((p) => p.completed).map((p) => p.lessonId),
    );

    const lastQuizAttempt = identity
      ? await ctx.db
          .query("quizAttempts")
          .withIndex("by_user_and_lesson", (q) =>
            q.eq("userId", identity.tokenIdentifier).eq("lessonId", lesson._id),
          )
          .order("desc")
          .first()
      : null;

    const orderedFlatLessons: Array<{
      _id: Id<"lessons">;
      slug: string;
      title: string;
      moduleId: Id<"modules">;
      moduleTitle: string;
      isFreePreview: boolean;
      durationSeconds: number;
      completed: boolean;
    }> = [];

    const curriculum = modules.map((mod) => {
      const modLessons = allLessons
        .filter((l) => l.moduleId === mod._id)
        .sort((a, b) => a.order - b.order)
        .map((l) => {
          const item = {
            _id: l._id,
            slug: l.slug,
            title: l.title,
            moduleId: mod._id,
            moduleTitle: mod.title,
            isFreePreview: l.isFreePreview,
            durationSeconds: l.durationSeconds,
            completed: completedSet.has(l._id),
          };
          orderedFlatLessons.push(item);
          return item;
        });
      return {
        _id: mod._id,
        title: mod.title,
        order: mod.order,
        lessons: modLessons,
      };
    });

    const currentIdx = orderedFlatLessons.findIndex(
      (l) => l._id === lesson._id,
    );
    const prevLesson =
      currentIdx > 0 ? orderedFlatLessons[currentIdx - 1] : null;
    const nextLesson =
      currentIdx >= 0 && currentIdx < orderedFlatLessons.length - 1
        ? orderedFlatLessons[currentIdx + 1]
        : null;

    const activeModule = modules.find((m) => m._id === lesson.moduleId) ?? null;

    const canAccess =
      course.tier === "free" || lesson.isFreePreview || hasProAccess;

    return {
      course: {
        _id: course._id,
        slug: course.slug,
        title: course.title,
        tier: course.tier,
        tutorName: course.tutorName,
      },
      module: activeModule
        ? { _id: activeModule._id, title: activeModule.title }
        : null,
      lesson: {
        _id: lesson._id,
        title: lesson.title,
        slug: lesson.slug,
        summary: lesson.summary,
        order: lesson.order,
        isFreePreview: lesson.isFreePreview,
        durationSeconds: lesson.durationSeconds,
        muxStatus: lesson.muxStatus,
        markdownContent: canAccess ? lesson.markdownContent : "",
        muxPlaybackId: canAccess ? (lesson.muxPlaybackId ?? null) : null,
        quiz: canAccess ? (lesson.quiz ?? []) : [],
      },
      isLocked: !canAccess,
      isCompleted: completedSet.has(lesson._id),
      isEnrolled: Boolean(enrollment),
      completedCount: completedSet.size,
      totalLessons: orderedFlatLessons.length,
      prevLesson,
      nextLesson,
      curriculum,
      lastQuizAttempt: lastQuizAttempt
        ? {
            score: lastQuizAttempt.score,
            total: lastQuizAttempt.total,
            answers: lastQuizAttempt.answers,
            completedAt: lastQuizAttempt.completedAt,
          }
        : null,
    };
  },
});

export const getCatalogSnapshot = query({
  args: {
    courseSlug: v.optional(v.string()),
    lessonSlug: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_published_and_order", (q) => q.eq("published", true))
      .order("asc")
      .take(50);

    const catalog = await Promise.all(
      courses.map(async (course) => {
        const modules = await ctx.db
          .query("modules")
          .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
          .order("asc")
          .take(50);
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .take(200);
        return {
          id: course._id,
          slug: course.slug,
          title: course.title,
          subtitle: course.subtitle,
          category: course.category,
          level: course.level,
          tier: course.tier,
          estimatedHours: course.estimatedHours,
          tags: course.tags,
          modules: modules.map((m) => ({
            id: m._id,
            title: m.title,
            order: m.order,
            lessons: lessons
              .filter((l) => l.moduleId === m._id)
              .sort((a, b) => a.order - b.order)
              .map((l) => ({
                id: l._id,
                slug: l.slug,
                title: l.title,
                summary: l.summary,
                isFreePreview: l.isFreePreview,
                durationSeconds: l.durationSeconds,
              })),
          })),
        };
      }),
    );

    let activeLesson: {
      courseSlug: string;
      courseTitle: string;
      lessonSlug: string;
      lessonTitle: string;
      summary: string;
      markdownContent: string;
      quizCount: number;
    } | null = null;

    if (args.courseSlug && args.lessonSlug) {
      const course = courses.find((c) => c.slug === args.courseSlug);
      if (course) {
        const lesson = await ctx.db
          .query("lessons")
          .withIndex("by_course_and_slug", (q) =>
            q.eq("courseId", course._id).eq("slug", args.lessonSlug!),
          )
          .unique();
        if (lesson) {
          activeLesson = {
            courseSlug: course.slug,
            courseTitle: course.title,
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
            summary: lesson.summary,
            markdownContent: lesson.markdownContent,
            quizCount: lesson.quiz?.length ?? 0,
          };
        }
      }
    }

    return { courses: catalog, activeLesson };
  },
});

// ========================
// ADMIN QUERIES & MUTATIONS
// ========================

export const listAllAdmin = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const courses = await ctx.db
      .query("courses")
      .withIndex("by_order")
      .order("asc")
      .take(100);

    return await Promise.all(
      courses.map(async (course) => {
        const modules = await ctx.db
          .query("modules")
          .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
          .order("asc")
          .take(100);
        const lessons = await ctx.db
          .query("lessons")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .take(500);
        const enrollments = await ctx.db
          .query("enrollments")
          .withIndex("by_course", (q) => q.eq("courseId", course._id))
          .take(500);

        return {
          ...course,
          moduleCount: modules.length,
          lessonCount: lessons.length,
          freePreviewCount: lessons.filter((l) => l.isFreePreview).length,
          enrollmentCount: enrollments.length,
        };
      }),
    );
  },
});

export const getCourseAdmin = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const course = await ctx.db.get("courses", args.courseId);
    if (!course) return null;

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", course._id))
      .order("asc")
      .take(100);

    const allLessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", course._id))
      .take(500);

    return {
      ...course,
      modules: modules.map((mod) => ({
        ...mod,
        lessons: allLessons
          .filter((l) => l.moduleId === mod._id)
          .sort((a, b) => a.order - b.order),
      })),
    };
  },
});

export const createCourse = mutation({
  args: {
    slug: v.string(),
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    category: v.string(),
    level: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    tier: v.union(v.literal("free"), v.literal("pro")),
    published: v.boolean(),
    featured: v.boolean(),
    estimatedHours: v.number(),
    tags: v.array(v.string()),
    tutorName: v.optional(v.string()),
    tutorTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) {
      throw new Error(`A course with slug "${args.slug}" already exists.`);
    }
    const existingCourses = await ctx.db
      .query("courses")
      .withIndex("by_order")
      .order("desc")
      .take(1);
    const nextOrder = (existingCourses[0]?.order ?? -1) + 1;
    const now = Date.now();

    return await ctx.db.insert("courses", {
      slug: args.slug,
      title: args.title,
      subtitle: args.subtitle,
      description: args.description,
      thumbnailUrl: args.thumbnailUrl,
      category: args.category,
      level: args.level,
      tier: args.tier,
      published: args.published,
      featured: args.featured,
      estimatedHours: args.estimatedHours,
      tags: args.tags,
      tutorName: args.tutorName ?? "Sonny Sangha",
      tutorTitle: args.tutorTitle ?? "Founder & Lead Instructor",
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id("courses"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    subtitle: v.optional(v.string()),
    description: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal("beginner"),
        v.literal("intermediate"),
        v.literal("advanced"),
      ),
    ),
    tier: v.optional(v.union(v.literal("free"), v.literal("pro"))),
    published: v.optional(v.boolean()),
    featured: v.optional(v.boolean()),
    estimatedHours: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { courseId, ...fields } = args;
    const existing = await ctx.db.get("courses", courseId);
    if (!existing) throw new Error("Course not found.");

    if (fields.slug && fields.slug !== existing.slug) {
      const slugConflict = await ctx.db
        .query("courses")
        .withIndex("by_slug", (q) => q.eq("slug", fields.slug!))
        .unique();
      if (slugConflict) {
        throw new Error(`Slug "${fields.slug}" is already taken.`);
      }
    }

    await ctx.db.patch("courses", courseId, {
      ...fields,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(500);
    for (const lesson of lessons) {
      await ctx.db.delete("lessons", lesson._id);
    }
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .take(100);
    for (const mod of modules) {
      await ctx.db.delete("modules", mod._id);
    }
    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_course", (q) => q.eq("courseId", args.courseId))
      .take(500);
    for (const enrollment of enrollments) {
      await ctx.db.delete("enrollments", enrollment._id);
    }
    await ctx.db.delete("courses", args.courseId);
    return null;
  },
});

export const createModule = mutation({
  args: {
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("modules")
      .withIndex("by_course_and_order", (q) => q.eq("courseId", args.courseId))
      .order("desc")
      .take(1);
    const nextOrder = (existing[0]?.order ?? -1) + 1;
    const now = Date.now();
    return await ctx.db.insert("modules", {
      courseId: args.courseId,
      title: args.title,
      description: args.description,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateModule = mutation({
  args: {
    moduleId: v.id("modules"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { moduleId, ...fields } = args;
    await ctx.db.patch("modules", moduleId, {
      ...fields,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteModule = mutation({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lessons = await ctx.db
      .query("lessons")
      .withIndex("by_module_and_order", (q) => q.eq("moduleId", args.moduleId))
      .take(200);
    for (const lesson of lessons) {
      await ctx.db.delete("lessons", lesson._id);
    }
    await ctx.db.delete("modules", args.moduleId);
    return null;
  },
});

export const createLesson = mutation({
  args: {
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    isFreePreview: v.boolean(),
    durationSeconds: v.number(),
    markdownContent: v.string(),
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    muxUploadId: v.optional(v.string()),
    muxStatus: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("waiting"),
        v.literal("ready"),
        v.literal("errored"),
      ),
    ),
    quiz: v.optional(v.array(quizQuestionValidator)),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const conflict = await ctx.db
      .query("lessons")
      .withIndex("by_course_and_slug", (q) =>
        q.eq("courseId", args.courseId).eq("slug", args.slug),
      )
      .unique();
    if (conflict) {
      throw new Error(`Lesson slug "${args.slug}" already exists in course.`);
    }
    const existing = await ctx.db
      .query("lessons")
      .withIndex("by_module_and_order", (q) => q.eq("moduleId", args.moduleId))
      .order("desc")
      .take(1);
    const nextOrder = (existing[0]?.order ?? -1) + 1;
    const now = Date.now();
    return await ctx.db.insert("lessons", {
      courseId: args.courseId,
      moduleId: args.moduleId,
      title: args.title,
      slug: args.slug,
      summary: args.summary,
      order: nextOrder,
      isFreePreview: args.isFreePreview,
      durationSeconds: args.durationSeconds,
      markdownContent: args.markdownContent,
      muxAssetId: args.muxAssetId,
      muxPlaybackId: args.muxPlaybackId,
      muxUploadId: args.muxUploadId,
      muxStatus: args.muxStatus ?? (args.muxPlaybackId ? "ready" : "idle"),
      quiz: args.quiz ?? [],
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateLesson = mutation({
  args: {
    lessonId: v.id("lessons"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    summary: v.optional(v.string()),
    order: v.optional(v.number()),
    isFreePreview: v.optional(v.boolean()),
    durationSeconds: v.optional(v.number()),
    markdownContent: v.optional(v.string()),
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    muxUploadId: v.optional(v.string()),
    muxStatus: v.optional(
      v.union(
        v.literal("idle"),
        v.literal("waiting"),
        v.literal("ready"),
        v.literal("errored"),
      ),
    ),
    quiz: v.optional(v.array(quizQuestionValidator)),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { lessonId, ...fields } = args;
    await ctx.db.patch("lessons", lessonId, {
      ...fields,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const deleteLesson = mutation({
  args: { lessonId: v.id("lessons") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete("lessons", args.lessonId);
    return null;
  },
});
