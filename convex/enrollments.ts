import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getOptionalIdentity, requireIdentity } from "./lib/auth";

export const enroll = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const course = await ctx.db.get("courses", args.courseId);
    if (!course || !course.published) {
      throw new Error("Course not found.");
    }

    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("courseId", args.courseId),
      )
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("enrollments", {
      userId: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      courseId: args.courseId,
      enrolledAt: Date.now(),
    });
  },
});

export const unenroll = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("courseId", args.courseId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete("enrollments", existing._id);
    }
    return null;
  },
});

export const toggleLessonComplete = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();

    const enrollment = await ctx.db
      .query("enrollments")
      .withIndex("by_user_and_course", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("courseId", args.courseId),
      )
      .unique();

    if (!enrollment) {
      await ctx.db.insert("enrollments", {
        userId: identity.tokenIdentifier,
        clerkUserId: identity.subject,
        courseId: args.courseId,
        enrolledAt: now,
      });
    }

    const existing = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user_and_lesson", (q) =>
        q
          .eq("userId", identity.tokenIdentifier)
          .eq("lessonId", args.lessonId),
      )
      .unique();

    if (existing) {
      await ctx.db.patch("lessonProgress", existing._id, {
        completed: args.completed,
        completedAt: args.completed ? now : undefined,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("lessonProgress", {
      userId: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      courseId: args.courseId,
      lessonId: args.lessonId,
      completed: args.completed,
      completedAt: args.completed ? now : undefined,
      updatedAt: now,
    });
  },
});

export const recordQuizAttempt = mutation({
  args: {
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
    answers: v.array(v.number()),
    score: v.number(),
    total: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    return await ctx.db.insert("quizAttempts", {
      userId: identity.tokenIdentifier,
      clerkUserId: identity.subject,
      courseId: args.courseId,
      lessonId: args.lessonId,
      answers: args.answers,
      score: args.score,
      total: args.total,
      completedAt: Date.now(),
    });
  },
});

export const getMyLearningDashboard = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getOptionalIdentity(ctx);
    if (!identity) {
      return null;
    }

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .take(100);

    const progressRows = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(1000);

    const quizRows = await ctx.db
      .query("quizAttempts")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .order("desc")
      .take(100);

    const completedLessonIds = new Set(
      progressRows.filter((p) => p.completed).map((p) => p.lessonId),
    );

    const enrolledCourses = (
      await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = await ctx.db.get("courses", enrollment.courseId);
          if (!course || !course.published) return null;

          const modules = await ctx.db
            .query("modules")
            .withIndex("by_course_and_order", (q) =>
              q.eq("courseId", course._id),
            )
            .order("asc")
            .take(100);
          const allLessons = await ctx.db
            .query("lessons")
            .withIndex("by_course", (q) => q.eq("courseId", course._id))
            .take(500);

          const orderedLessons = modules.flatMap((mod) =>
            allLessons
              .filter((l) => l.moduleId === mod._id)
              .sort((a, b) => a.order - b.order),
          );

          const completedCount = orderedLessons.filter((l) =>
            completedLessonIds.has(l._id),
          ).length;
          const nextIncomplete =
            orderedLessons.find((l) => !completedLessonIds.has(l._id)) ??
            orderedLessons[0] ??
            null;

          return {
            _id: course._id,
            slug: course.slug,
            title: course.title,
            subtitle: course.subtitle,
            thumbnailUrl: course.thumbnailUrl,
            category: course.category,
            level: course.level,
            tier: course.tier,
            enrolledAt: enrollment.enrolledAt,
            totalLessons: orderedLessons.length,
            completedLessons: completedCount,
            progressPercent:
              orderedLessons.length > 0
                ? Math.round((completedCount / orderedLessons.length) * 100)
                : 0,
            nextLessonSlug: nextIncomplete?.slug ?? null,
            nextLessonTitle: nextIncomplete?.title ?? null,
          };
        }),
      )
    ).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      enrolledCourses,
      totalCompletedLessons: completedLessonIds.size,
      totalQuizAttempts: quizRows.length,
      completedCoursesCount: enrolledCourses.filter(
        (c) => c.totalLessons > 0 && c.completedLessons === c.totalLessons,
      ).length,
    };
  },
});

export const getUserProgressForAgent = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getOptionalIdentity(ctx);
    if (!identity) {
      return null;
    }

    const enrollments = await ctx.db
      .query("enrollments")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(100);

    const progressRows = await ctx.db
      .query("lessonProgress")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .take(1000);

    const completedSet = new Set(
      progressRows.filter((p) => p.completed).map((p) => p.lessonId),
    );

    const courses = (
      await Promise.all(
        enrollments.map(async (e) => {
          const course = await ctx.db.get("courses", e.courseId);
          if (!course) return null;
          const lessons = await ctx.db
            .query("lessons")
            .withIndex("by_course", (q) => q.eq("courseId", course._id))
            .take(500);
          const completed = lessons.filter((l) => completedSet.has(l._id));
          const remaining = lessons.filter((l) => !completedSet.has(l._id));
          return {
            slug: course.slug,
            title: course.title,
            tier: course.tier,
            completedCount: completed.length,
            totalLessons: lessons.length,
            completedLessons: completed.map((l) => ({
              slug: l.slug,
              title: l.title,
            })),
            nextLesson: remaining[0]
              ? { slug: remaining[0].slug, title: remaining[0].title }
              : null,
          };
        }),
      )
    ).filter((c): c is NonNullable<typeof c> => c !== null);

    return {
      enrolledCourses: courses,
      totalCompletedLessons: completedSet.size,
    };
  },
});
