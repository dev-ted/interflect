import { Suspense, type ReactNode } from "react";
import { LessonLayoutShell } from "@/components/course/LessonLayoutShell";

export default function LessonsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-5 h-7 w-72 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
              <div className="aspect-video animate-pulse rounded-2xl bg-zinc-100 lg:col-span-8 dark:bg-zinc-900" />
              <div className="h-[420px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-4 dark:bg-zinc-900" />
            </div>
          </div>
        </main>
      }
    >
      <LessonLayoutShell>{children}</LessonLayoutShell>
    </Suspense>
  );
}
