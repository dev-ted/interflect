import { Suspense, type ReactNode } from "react";
import { LessonLayoutShell } from "@/components/course/LessonLayoutShell";

export default function LessonsLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
          <div className="mb-6 h-6 w-64 animate-pulse rounded-md bg-subtle motion-reduce:animate-none" />
          <div className="aspect-video w-full animate-pulse rounded-xl bg-subtle motion-reduce:animate-none" />
        </main>
      }
    >
      <LessonLayoutShell>{children}</LessonLayoutShell>
    </Suspense>
  );
}
