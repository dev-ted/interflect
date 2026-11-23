import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const quizQuestionValidator = v.object({
  id: v.string(),
  question: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
  explanation: v.string(),
});

export default defineSchema({
  courses: defineTable({
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
    tutorName: v.string(),
    tutorTitle: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_published_and_order", ["published", "order"])
    .index("by_order", ["order"]),

  modules: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_course_and_order", ["courseId", "order"]),

  lessons: defineTable({
    courseId: v.id("courses"),
    moduleId: v.id("modules"),
    title: v.string(),
    slug: v.string(),
    summary: v.string(),
    order: v.number(),
    isFreePreview: v.boolean(),
    durationSeconds: v.number(),
    markdownContent: v.string(),
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    // A pasted YouTube, Vimeo, Loom or file link, used instead of a Mux upload.
    videoUrl: v.optional(v.string()),
    muxUploadId: v.optional(v.string()),
    muxStatus: v.union(
      v.literal("idle"),
      v.literal("waiting"),
      v.literal("ready"),
      v.literal("errored"),
    ),
    quiz: v.optional(v.array(quizQuestionValidator)),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_module_and_order", ["moduleId", "order"])
    .index("by_course_and_slug", ["courseId", "slug"])
    .index("by_course", ["courseId"])
    .index("by_mux_upload_id", ["muxUploadId"]),

  enrollments: defineTable({
    userId: v.string(),
    clerkUserId: v.string(),
    courseId: v.id("courses"),
    enrolledAt: v.number(),
  })
    .index("by_user_and_course", ["userId", "courseId"])
    .index("by_user", ["userId"])
    .index("by_clerk_user_id", ["clerkUserId"])
    .index("by_course", ["courseId"]),

  lessonProgress: defineTable({
    userId: v.string(),
    clerkUserId: v.string(),
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
    updatedAt: v.number(),
  })
    .index("by_user_and_lesson", ["userId", "lessonId"])
    .index("by_user_and_course", ["userId", "courseId"])
    .index("by_user", ["userId"])
    .index("by_clerk_user_id", ["clerkUserId"]),

  quizAttempts: defineTable({
    userId: v.string(),
    clerkUserId: v.string(),
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
    score: v.number(),
    total: v.number(),
    answers: v.array(v.number()),
    completedAt: v.number(),
  })
    .index("by_user_and_lesson", ["userId", "lessonId"])
    .index("by_user", ["userId"])
    .index("by_clerk_user_id", ["clerkUserId"]),

  learnerSettings: defineTable({
    userId: v.string(),
    weeklyGoal: v.number(),
    hiddenWidgets: v.array(v.string()),
    range: v.union(v.literal("7d"), v.literal("30d"), v.literal("90d")),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  trackedCourses: defineTable({
    userId: v.string(),
    courseId: v.id("courses"),
    targetDate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_course", ["userId", "courseId"]),
});
