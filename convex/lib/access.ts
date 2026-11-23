import type { UserIdentity } from "convex/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { isAdminIdentity, isProIdentity } from "./auth";
import { publicCourse } from "./features";

/** The paywall rule used everywhere a learner reads or writes lesson data. */
export function canAccessLesson(
  course: Doc<"courses">,
  lesson: Doc<"lessons">,
  identity: UserIdentity | null,
): boolean {
  return publicCourse(course).tier === "free" || lesson.isFreePreview || isProIdentity(identity);
}

/** Loads a lesson the learner may use: it belongs to the course, the course is published, and they have access. */
export async function requireLearnerLesson(
  ctx: Pick<QueryCtx, "db">,
  identity: UserIdentity,
  courseId: Id<"courses">,
  lessonId: Id<"lessons">,
) {
  const [course, lesson] = await Promise.all([
    ctx.db.get("courses", courseId),
    ctx.db.get("lessons", lessonId),
  ]);
  if (!course || !lesson || lesson.courseId !== courseId || (!course.published && !isAdminIdentity(identity))) {
    throw new Error("Lesson not found.");
  }
  if (!canAccessLesson(course, lesson, identity)) throw new Error("This lesson needs Interflect Pro.");
  return { course, lesson };
}
