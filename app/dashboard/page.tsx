import { auth } from "@clerk/nextjs/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default async function DashboardPage() {
  await auth.protect();
  return (
    <main className="flex-1">
      <DashboardClient />
    </main>
  );
}
