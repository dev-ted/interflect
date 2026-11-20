import { Suspense } from "react";
import { LessonViewerClient } from "@/components/course/LessonViewerClient";

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
          <div className="h-80 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-900" />
        </div>
      }
    >
      <LessonViewerClient />
    </Suspense>
  );
}
