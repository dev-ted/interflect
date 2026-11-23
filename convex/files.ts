import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { requireAdmin } from "./lib/auth";
import { transcriptValidator } from "./schema";
import { clearTranscript } from "./lib/transcripts";

async function replaceStoredFile(
  ctx: MutationCtx,
  previous: Id<"_storage"> | undefined,
  next: Id<"_storage">,
) {
  if (previous && previous !== next) {
    await ctx.storage.delete(previous);
  }
}

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const setCourseThumbnail = mutation({
  args: {
    courseId: v.id("courses"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const course = await ctx.db.get("courses", args.courseId);
    if (!course) throw new Error("Course not found.");
    await replaceStoredFile(ctx, course.thumbnailStorageId, args.storageId);
    await ctx.db.patch("courses", args.courseId, {
      thumbnailStorageId: args.storageId,
      updatedAt: Date.now(),
    });
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const setLessonVideo = mutation({
  args: {
    lessonId: v.id("lessons"),
    storageId: v.id("_storage"),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const lesson = await ctx.db.get("lessons", args.lessonId);
    if (!lesson) throw new Error("Lesson not found.");
    await replaceStoredFile(ctx, lesson.videoStorageId, args.storageId);
    if (lesson.videoStorageId !== args.storageId) await clearTranscript(ctx, args.lessonId);
    await ctx.db.patch("lessons", args.lessonId, {
      videoStorageId: args.storageId,
      videoUrl: undefined,
      muxPlaybackId: undefined,
      muxAssetId: undefined,
      muxUploadId: undefined,
      muxStatus: "idle",
      ...(args.durationSeconds !== undefined && {
        durationSeconds: Math.max(1, Math.round(args.durationSeconds)),
      }),
      updatedAt: Date.now(),
    });
    return await ctx.storage.getUrl(args.storageId);
  },
});

/** Used by the local upload script. The admin UI uses the public mutations above. */
export const createUploadUrl = internalMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const attachCourseThumbnail = internalMutation({
  args: {
    courseSlug: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.courseSlug))
      .unique();
    if (!course) throw new Error(`No course with slug ${args.courseSlug}.`);
    await replaceStoredFile(ctx, course.thumbnailStorageId, args.storageId);
    await ctx.db.patch("courses", course._id, {
      thumbnailStorageId: args.storageId,
      updatedAt: Date.now(),
    });
    return course._id;
  },
});

export const attachLessonVideo = internalMutation({
  args: {
    courseSlug: v.string(),
    lessonSlug: v.string(),
    storageId: v.id("_storage"),
    durationSeconds: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.courseSlug))
      .unique();
    if (!course) throw new Error(`No course with slug ${args.courseSlug}.`);
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_course_and_slug", (q) =>
        q.eq("courseId", course._id).eq("slug", args.lessonSlug),
      )
      .unique();
    if (!lesson) throw new Error(`No lesson with slug ${args.lessonSlug}.`);
    await replaceStoredFile(ctx, lesson.videoStorageId, args.storageId);
    if (lesson.videoStorageId !== args.storageId) await clearTranscript(ctx, lesson._id);
    await ctx.db.patch("lessons", lesson._id, {
      videoStorageId: args.storageId,
      videoUrl: undefined,
      muxPlaybackId: undefined,
      muxAssetId: undefined,
      muxUploadId: undefined,
      muxStatus: "idle",
      ...(args.durationSeconds !== undefined && {
        durationSeconds: Math.max(1, Math.round(args.durationSeconds)),
      }),
      updatedAt: Date.now(),
    });
    return lesson._id;
  },
});

export const attachLessonTranscript = internalMutation({
  args: {
    courseSlug: v.string(),
    lessonSlug: v.string(),
    transcript: transcriptValidator,
  },
  handler: async (ctx, args) => {
    const course = await ctx.db
      .query("courses")
      .withIndex("by_slug", (q) => q.eq("slug", args.courseSlug))
      .unique();
    if (!course) throw new Error(`No course with slug ${args.courseSlug}.`);
    const lesson = await ctx.db
      .query("lessons")
      .withIndex("by_course_and_slug", (q) =>
        q.eq("courseId", course._id).eq("slug", args.lessonSlug),
      )
      .unique();
    if (!lesson) throw new Error(`No lesson with slug ${args.lessonSlug}.`);
    if (!lesson.videoStorageId) throw new Error(`${args.lessonSlug} has no uploaded video to transcribe.`);
    await clearTranscript(ctx, lesson._id);
    await ctx.db.insert("lessonTranscripts", { lessonId: lesson._id, ...args.transcript });
    return lesson._id;
  },
});

