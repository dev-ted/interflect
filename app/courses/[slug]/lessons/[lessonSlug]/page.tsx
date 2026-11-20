import { Suspense } from "react";
import { LessonViewerClient } from "@/components/course/LessonViewerClient";

async function LessonRouteContent({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  const { slug, lessonSlug } = await params;
  return <LessonViewerClient courseSlug={slug} lessonSlug={lessonSlug} />;
}

export default function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonSlug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-44 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      }
    >
      <LessonRouteContent params={params} />
    </Suspense>
  );
}
