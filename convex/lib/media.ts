import type { Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";

type StorageReader = Pick<QueryCtx, "storage">;

/** The image learners see: the uploaded file when there is one, otherwise the stored path. */
export async function thumbnailUrlFor(
  ctx: StorageReader,
  course: { thumbnailUrl: string; thumbnailStorageId?: Id<"_storage"> },
): Promise<string> {
  if (!course.thumbnailStorageId) return course.thumbnailUrl;
  return (await ctx.storage.getUrl(course.thumbnailStorageId)) ?? course.thumbnailUrl;
}

/**
 * Public course payloads should not carry the storage id. The URL is resolved
 * at read time so replacing the file updates every page.
 */
export async function presentCourse<
  T extends { thumbnailUrl: string; thumbnailStorageId?: Id<"_storage"> },
>(ctx: StorageReader, course: T): Promise<Omit<T, "thumbnailStorageId">> {
  const { thumbnailStorageId: _storageId, ...rest } = course;
  return {
    ...rest,
    thumbnailUrl: await thumbnailUrlFor(ctx, course),
  };
}
