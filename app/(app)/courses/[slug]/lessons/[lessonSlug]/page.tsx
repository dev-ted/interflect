import { Suspense } from "react";
import { LessonViewerClient } from "@/components/course/LessonViewerClient";

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="aspect-video w-full animate-pulse rounded-xl bg-subtle motion-reduce:animate-none" />
      }
    >
      <LessonViewerClient />
    </Suspense>
  );
}
