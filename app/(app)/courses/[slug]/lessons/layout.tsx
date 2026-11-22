import { Suspense, type ReactNode } from "react";
import { LessonLayoutShell } from "@/components/course/LessonLayoutShell";

export default function LessonsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 h-7 w-72 animate-pulse rounded-lg bg-[#F6EFE0] dark:bg-[#16161F]" />
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="aspect-video animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] lg:col-span-8 dark:border-[#323244] dark:bg-[#16161F]" />
              <div className="h-[420px] animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] lg:col-span-4 dark:border-[#323244] dark:bg-[#16161F]" />
            </div>
          </div>
        </main>
      }
    >
      <LessonLayoutShell>{children}</LessonLayoutShell>
    </Suspense>
  );
}
