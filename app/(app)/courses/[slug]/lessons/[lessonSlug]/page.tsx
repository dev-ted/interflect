import { Suspense } from "react";
import { LessonViewerClient } from "@/components/course/LessonViewerClient";

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-w-0 space-y-6">
          <div className="aspect-video w-full animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
          <div className="h-24 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
          <div className="h-80 animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]" />
        </div>
      }
    >
      <LessonViewerClient />
    </Suspense>
  );
}
