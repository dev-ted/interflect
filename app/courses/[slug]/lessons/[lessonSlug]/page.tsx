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
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
        }
      >
        <LessonRouteContent params={params} />
      </Suspense>
    </main>
  );
}
