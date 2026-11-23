import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getTranscript(ctx: Pick<QueryCtx, "db">, lessonId: Id<"lessons">) {
  return await ctx.db
    .query("lessonTranscripts")
    .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
    .unique();
}

/** A transcript only describes the video it was made from, so drop it whenever the video changes. */
export async function clearTranscript(ctx: Pick<MutationCtx, "db">, lessonId: Id<"lessons">) {
  const row = await getTranscript(ctx, lessonId);
  if (row) await ctx.db.delete("lessonTranscripts", row._id);
}
