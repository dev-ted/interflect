import { Suspense } from "react";
import { CourseDetailClient } from "@/components/course/CourseDetailClient";

async function CourseRouteContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CourseDetailClient slug={slug} />;
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <main className="flex-1">
      <Suspense
        fallback={
          <div className="mx-auto max-w-5xl px-4 py-12">
            <div className="h-64 animate-pulse rounded-3xl bg-zinc-100 dark:bg-zinc-900" />
          </div>
        }
      >
        <CourseRouteContent params={params} />
      </Suspense>
    </main>
  );
}
