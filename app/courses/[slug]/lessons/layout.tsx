import { Suspense, type ReactNode } from "react";
import { LessonLayoutShell } from "@/components/course/LessonLayoutShell";

async function LessonLayoutContent({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  const { slug } = await params;
  return <LessonLayoutShell courseSlug={slug}>{children}</LessonLayoutShell>;
}

export default function LessonsLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>;
  children: ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-8 dark:bg-zinc-900" />
              <div className="h-[520px] animate-pulse rounded-2xl bg-zinc-100 lg:col-span-4 dark:bg-zinc-900" />
            </div>
          </div>
        </main>
      }
    >
      <LessonLayoutContent params={params}>{children}</LessonLayoutContent>
    </Suspense>
  );
}
