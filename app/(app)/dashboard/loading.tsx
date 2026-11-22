import { DashboardSkeleton } from "@/components/dashboard/DashboardClient";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <p role="status" className="sr-only">
        Loading your learning
      </p>
      <DashboardSkeleton />
    </main>
  );
}
