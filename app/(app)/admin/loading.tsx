import { AdminSkeleton } from "@/components/admin/AdminStudioClient";

export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <p role="status" className="sr-only">
        Loading the admin studio
      </p>
      <AdminSkeleton />
    </main>
  );
}
