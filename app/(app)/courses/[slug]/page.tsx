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
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <Suspense
        fallback={
          <div className="h-72 animate-pulse rounded-3xl bg-subtle motion-reduce:animate-none" />
        }
      >
        <CourseRouteContent params={params} />
      </Suspense>
    </main>
  );
}
