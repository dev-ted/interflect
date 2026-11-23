import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { getOptionalIdentity, requireAdmin, requireIdentity } from "./lib/auth";

const DAY = 86_400_000;
const rangeValidator = v.union(v.literal("7d"), v.literal("30d"), v.literal("90d"));
const DEFAULT_SETTINGS = { weeklyGoal: 3, hiddenWidgets: [] as string[], range: "30d" as const };

// Queries can't read the clock, so the client passes `now` and its timezone offset (minutes ahead of UTC).
const timeArgs = { now: v.number(), tzOffsetMinutes: v.number(), days: v.number() };

/** Local calendar day number for a timestamp. */
const dayOf = (ts: number, tz: number) => Math.floor((ts + tz * 60_000) / DAY);
const isoOf = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);
const pct = (score: number, total: number) => (total > 0 ? Math.round((score / total) * 100) : 0);
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

/** Lesson counts per course, ordered by module then lesson. */
async function courseLessons(ctx: QueryCtx, courseId: Id<"courses">) {
  return await ctx.db
    .query("lessons")
    .withIndex("by_course", (q) => q.eq("courseId", courseId))
    .take(500);
}

/* ── Settings ─────────────────────────────────────────────────────────── */

export const getMySettings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getOptionalIdentity(ctx);
    if (!identity) return null;
    const row = await ctx.db
      .query("learnerSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
    return row
      ? { weeklyGoal: row.weeklyGoal, hiddenWidgets: row.hiddenWidgets, range: row.range }
      : DEFAULT_SETTINGS;
  },
});

export const updateMySettings = mutation({
  args: {
    weeklyGoal: v.optional(v.number()),
    hiddenWidgets: v.optional(v.array(v.string())),
    range: v.optional(rangeValidator),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    if (args.weeklyGoal !== undefined && (args.weeklyGoal < 1 || args.weeklyGoal > 14)) {
      throw new Error("Weekly goal must be between 1 and 14 lessons.");
    }
    const existing = await ctx.db
      .query("learnerSettings")
      .withIndex("by_user", (q) => q.eq("userId", identity.tokenIdentifier))
      .unique();
    const patch = {
      ...(args.weeklyGoal !== undefined && { weeklyGoal: Math.round(args.weeklyGoal) }),
      ...(args.hiddenWidgets !== undefined && { hiddenWidgets: args.hiddenWidgets.slice(0, 20) }),
      ...(args.range !== undefined && { range: args.range }),
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch("learnerSettings", existing._id, patch);
    } else {
      await ctx.db.insert("learnerSettings", {
        userId: identity.tokenIdentifier,
        ...DEFAULT_SETTINGS,
        ...patch,
      });
    }
    return null;
  },
});

/* ── Tracking ─────────────────────────────────────────────────────────── */

export const isTracked = query({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await getOptionalIdentity(ctx);
    if (!identity) return null;
    const row = await ctx.db
      .query("trackedCourses")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("courseId", args.courseId),
      )
      .unique();
    return row ? { targetDate: row.targetDate ?? null } : null;
  },
});

export const trackCourse = mutation({
  args: { courseId: v.id("courses"), targetDate: v.optional(v.union(v.number(), v.null())) },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const course = await ctx.db.get("courses", args.courseId);
    if (!course || !course.published) throw new Error("Course not found.");
    const existing = await ctx.db
      .query("trackedCourses")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("courseId", args.courseId),
      )
      .unique();
    const targetDate = args.targetDate ?? undefined;
    if (existing) {
      if (args.targetDate !== undefined) {
        await ctx.db.patch("trackedCourses", existing._id, { targetDate });
      }
      return existing._id;
    }
    return await ctx.db.insert("trackedCourses", {
      userId: identity.tokenIdentifier,
      courseId: args.courseId,
      targetDate,
      createdAt: Date.now(),
    });
  },
});

export const untrackCourse = mutation({
  args: { courseId: v.id("courses") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const existing = await ctx.db
      .query("trackedCourses")
      .withIndex("by_user_and_course", (q) =>
        q.eq("userId", identity.tokenIdentifier).eq("courseId", args.courseId),
      )
      .unique();
    if (existing) await ctx.db.delete("trackedCourses", existing._id);
    return null;
  },
});

/* ── Learner insights ─────────────────────────────────────────────────── */

export const getMyInsights = query({
  args: timeArgs,
  handler: async (ctx, { now, tzOffsetMinutes: tz, days }) => {
    const identity = await getOptionalIdentity(ctx);
    if (!identity) return null;
    const userId = identity.tokenIdentifier;
    const span = Math.min(Math.max(Math.round(days), 1), 120);

    const [progress, quizzes, settingsRow, trackedRows] = await Promise.all([
      ctx.db.query("lessonProgress").withIndex("by_user", (q) => q.eq("userId", userId)).take(2000),
      ctx.db.query("quizAttempts").withIndex("by_user", (q) => q.eq("userId", userId)).take(2000),
      ctx.db.query("learnerSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("trackedCourses").withIndex("by_user", (q) => q.eq("userId", userId)).take(50),
    ]);
    const weeklyGoal = settingsRow?.weeklyGoal ?? DEFAULT_SETTINGS.weeklyGoal;

    const completed = progress.filter(
      (p): p is Doc<"lessonProgress"> & { completedAt: number } => p.completed && p.completedAt !== undefined,
    );
    const lessonDocs = new Map<string, Doc<"lessons">>();
    for (const id of new Set([...completed.map((p) => p.lessonId), ...quizzes.map((q) => q.lessonId)])) {
      const lesson = await ctx.db.get("lessons", id);
      if (lesson) lessonDocs.set(id, lesson);
    }

    const today = dayOf(now, tz);
    const first = today - span + 1;
    const prevFirst = first - span;

    // Daily buckets for the selected range.
    const series = Array.from({ length: span }, (_, i) => ({
      date: isoOf(first + i),
      lessons: 0,
      quizzes: 0,
      minutes: 0,
    }));
    const totals = { lessons: 0, minutes: 0, quizzes: 0, scores: [] as number[] };
    const previous = { lessons: 0, minutes: 0, quizzes: 0, scores: [] as number[] };
    const activeDays = new Set<number>();

    for (const p of completed) {
      const d = dayOf(p.completedAt, tz);
      activeDays.add(d);
      const minutes = Math.round((lessonDocs.get(p.lessonId)?.durationSeconds ?? 0) / 60);
      if (d >= first && d <= today) {
        series[d - first].lessons += 1;
        series[d - first].minutes += minutes;
        totals.lessons += 1;
        totals.minutes += minutes;
      } else if (d >= prevFirst && d < first) {
        previous.lessons += 1;
        previous.minutes += minutes;
      }
    }

    const quizScores: { at: number; score: number; lesson: string }[] = [];
    for (const q of quizzes) {
      const d = dayOf(q.completedAt, tz);
      activeDays.add(d);
      const score = pct(q.score, q.total);
      if (d >= first && d <= today) {
        series[d - first].quizzes += 1;
        totals.quizzes += 1;
        totals.scores.push(score);
        quizScores.push({ at: q.completedAt, score, lesson: lessonDocs.get(q.lessonId)?.title ?? "Lesson" });
      } else if (d >= prevFirst && d < first) {
        previous.quizzes += 1;
        previous.scores.push(score);
      }
    }
    quizScores.sort((a, b) => a.at - b.at);

    // Streaks: consecutive active days. Today not being active yet doesn't break it.
    let current = 0;
    for (let d = activeDays.has(today) ? today : today - 1; activeDays.has(d); d--) current++;
    let longest = 0;
    let run = 0;
    for (const d of [...activeDays].sort((a, b) => a - b)) {
      run = activeDays.has(d - 1) ? run + 1 : 1;
      longest = Math.max(longest, run);
    }

    // This week, Monday to Sunday in the learner's timezone (day 0 was a Thursday).
    const weekStart = today - ((today + 3) % 7);
    const weekDone = completed.filter((p) => dayOf(p.completedAt, tz) >= weekStart).length;

    // 26-week calendar: activity count per day.
    const heatFirst = today - 26 * 7 + 1;
    const heat = new Map<number, number>();
    for (const p of completed) {
      const d = dayOf(p.completedAt, tz);
      if (d >= heatFirst) heat.set(d, (heat.get(d) ?? 0) + 1);
    }
    for (const q of quizzes) {
      const d = dayOf(q.completedAt, tz);
      if (d >= heatFirst) heat.set(d, (heat.get(d) ?? 0) + 1);
    }
    const heatmap = Array.from({ length: today - heatFirst + 1 }, (_, i) => {
      const d = heatFirst + i;
      return [isoOf(d), heat.get(d) ?? 0] as [string, number];
    });

    // Tracked courses with pace against their target date.
    const completedIds = new Set(completed.map((p) => p.lessonId));
    const tracked = (
      await Promise.all(
        trackedRows.map(async (t) => {
          const course = await ctx.db.get("courses", t.courseId);
          if (!course || !course.published) return null;
          const lessons = await courseLessons(ctx, course._id);
          const done = lessons.filter((l) => completedIds.has(l._id)).length;
          const percent = lessons.length ? Math.round((done / lessons.length) * 100) : 0;
          let pace: "ahead" | "on-track" | "behind" | null = null;
          if (t.targetDate) {
            if (percent >= 100) pace = "ahead";
            else if (now > t.targetDate) pace = "behind";
            else {
              const expected = ((now - t.createdAt) / Math.max(t.targetDate - t.createdAt, DAY)) * 100;
              pace = percent - expected >= 10 ? "ahead" : percent - expected >= -10 ? "on-track" : "behind";
            }
          }
          return {
            courseId: course._id,
            slug: course.slug,
            title: course.title,
            thumbnailUrl: course.thumbnailUrl,
            completedLessons: done,
            totalLessons: lessons.length,
            percent,
            targetDate: t.targetDate ?? null,
            pace,
          };
        }),
      )
    ).filter((t): t is NonNullable<typeof t> => t !== null);

    return {
      series,
      totals: { lessons: totals.lessons, minutes: totals.minutes, quizzes: totals.quizzes, avgScore: avg(totals.scores) },
      previous: {
        lessons: previous.lessons,
        minutes: previous.minutes,
        quizzes: previous.quizzes,
        avgScore: avg(previous.scores),
      },
      quizScores,
      streak: { current, longest, activeToday: activeDays.has(today) },
      week: { done: weekDone, goal: weeklyGoal },
      heatmap,
      tracked,
      hasAnyActivity: completed.length > 0 || quizzes.length > 0,
    };
  },
});

/* ── Admin insights ───────────────────────────────────────────────────── */

export const getAdminInsights = query({
  args: timeArgs,
  handler: async (ctx, { now, tzOffsetMinutes: tz, days }) => {
    await requireAdmin(ctx);
    const span = Math.min(Math.max(Math.round(days), 1), 120);
    const today = dayOf(now, tz);
    const first = today - span + 1;
    const prevFirst = first - span;
    const inRange = (d: number) => d >= first && d <= today;
    const inPrev = (d: number) => d >= prevFirst && d < first;

    // ponytail: bounded scans are fine at this scale; switch to @convex-dev/aggregate past a few thousand rows.
    const [enrollments, progress, quizzes, courses] = await Promise.all([
      ctx.db.query("enrollments").order("desc").take(5000),
      ctx.db.query("lessonProgress").order("desc").take(5000),
      ctx.db.query("quizAttempts").order("desc").take(5000),
      ctx.db.query("courses").withIndex("by_order").take(100),
    ]);
    const completed = progress.filter((p) => p.completed && p.completedAt !== undefined);

    const series = Array.from({ length: span }, (_, i) => ({ date: isoOf(first + i), enrollments: 0, completions: 0 }));
    const kpi = {
      enrollments: [0, 0],
      completions: [0, 0],
      quizzes: [0, 0],
      scores: [[], []] as number[][],
      newLearners: [0, 0],
    };

    const firstEnrollment = new Map<string, number>();
    for (const e of enrollments) {
      firstEnrollment.set(e.userId, Math.min(firstEnrollment.get(e.userId) ?? Infinity, e.enrolledAt));
      const d = dayOf(e.enrolledAt, tz);
      if (inRange(d)) {
        series[d - first].enrollments += 1;
        kpi.enrollments[0] += 1;
      } else if (inPrev(d)) kpi.enrollments[1] += 1;
    }
    for (const at of firstEnrollment.values()) {
      const d = dayOf(at, tz);
      if (inRange(d)) kpi.newLearners[0] += 1;
      else if (inPrev(d)) kpi.newLearners[1] += 1;
    }
    for (const p of completed) {
      const d = dayOf(p.completedAt!, tz);
      if (inRange(d)) {
        series[d - first].completions += 1;
        kpi.completions[0] += 1;
      } else if (inPrev(d)) kpi.completions[1] += 1;
    }
    for (const q of quizzes) {
      const d = dayOf(q.completedAt, tz);
      const slot = inRange(d) ? 0 : inPrev(d) ? 1 : -1;
      if (slot >= 0) {
        kpi.quizzes[slot] += 1;
        kpi.scores[slot].push(pct(q.score, q.total));
      }
    }

    // Per course: enrollments, completion rate, average quiz score.
    const completedByUser = new Map<string, Set<string>>();
    for (const p of completed) {
      if (!completedByUser.has(p.userId)) completedByUser.set(p.userId, new Set());
      completedByUser.get(p.userId)!.add(p.lessonId);
    }
    const quizByLesson = new Map<string, number[]>();
    for (const q of quizzes) {
      if (!quizByLesson.has(q.lessonId)) quizByLesson.set(q.lessonId, []);
      quizByLesson.get(q.lessonId)!.push(pct(q.score, q.total));
    }

    const lessonInfo = new Map<string, { title: string; courseTitle: string; courseId: Id<"courses"> }>();
    const coursePerformance = await Promise.all(
      courses.map(async (course) => {
        const lessons = await courseLessons(ctx, course._id);
        for (const l of lessons) lessonInfo.set(l._id, { title: l.title, courseTitle: course.title, courseId: course._id });
        const enrolled = enrollments.filter((e) => e.courseId === course._id);
        const finished = enrolled.filter((e) => {
          const done = completedByUser.get(e.userId);
          return lessons.length > 0 && lessons.every((l) => done?.has(l._id));
        }).length;
        const scores = lessons.flatMap((l) => quizByLesson.get(l._id) ?? []);
        return {
          courseId: course._id,
          slug: course.slug,
          title: course.title,
          published: course.published,
          tier: course.tier,
          lessons: lessons.length,
          enrollments: enrolled.length,
          completionRate: enrolled.length ? Math.round((finished / enrolled.length) * 100) : 0,
          avgScore: avg(scores),
        };
      }),
    );

    const hardestLessons = [...quizByLesson.entries()]
      .map(([lessonId, scores]) => ({ lessonId, attempts: scores.length, avgScore: avg(scores)!, ...lessonInfo.get(lessonId) }))
      .filter((l) => l.title)
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 5);

    return {
      kpis: {
        learners: { value: firstEnrollment.size, inRange: kpi.newLearners[0], previous: kpi.newLearners[1] },
        enrollments: { value: kpi.enrollments[0], previous: kpi.enrollments[1] },
        completions: { value: kpi.completions[0], previous: kpi.completions[1] },
        quizzes: { value: kpi.quizzes[0], previous: kpi.quizzes[1] },
        avgScore: { value: avg(kpi.scores[0]), previous: avg(kpi.scores[1]) },
      },
      series,
      coursePerformance,
      hardestLessons,
    };
  },
});
