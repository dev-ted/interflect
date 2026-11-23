import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const quizQuestionValidator = v.object({
  id: v.string(),
  question: v.string(),
  options: v.array(v.string()),
  correctIndex: v.number(),
  explanation: v.string(),
});

// Narration of an uploaded lesson video: paragraphs for the transcript, cues for captions. Times in seconds.
export const transcriptValidator = v.object({
  paragraphs: v.array(v.object({ start: v.number(), text: v.string() })),
  cues: v.array(v.object({ start: v.number(), end: v.number(), text: v.string() })),
});

export default defineSchema({
  courses: defineTable({
    slug: v.string(),
    title: v.string(),
    subtitle: v.string(),
    description: v.string(),
    thumbnailUrl: v.string(),
    // Uploaded image. When set, queries serve its storage URL instead of thumbnailUrl.
    thumbnailStorageId: v.optional(v.id("_storage")),
    category: v.string(),
    level: v.union(
      v.literal("beginner"),
      v.literal("intermediate"),
      v.literal("advanced"),
    ),
    tier: v.union(v.literal("free"), v.literal("pro")),
    published: v.boolean(),
    featured: v.boolean(),
    // Fallback shown only before the course has lessons. Public pages use the sum of lesson times.
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
    // Time for an average adult to finish the lesson page (reading, examples, quiz). Not the voiceover.
    durationSeconds: v.number(),
    markdownContent: v.string(),
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    // A pasted YouTube, Vimeo, Loom or file link, used instead of a Mux upload.
    videoUrl: v.optional(v.string()),
    // Uploaded lesson file. When set, the player uses this instead of Mux or videoUrl.
    videoStorageId: v.optional(v.id("_storage")),
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

  // Kept apart from lessons so catalog and progress queries don't read captions they never show.
  lessonTranscripts: defineTable({
    lessonId: v.id("lessons"),
    ...transcriptValidator.fields,
  }).index("by_lesson", ["lessonId"]),

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
