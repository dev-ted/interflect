import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = { title: "My learning" };

export default async function DashboardPage() {
  await auth.protect();
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-10">
      <DashboardClient />
    </main>
  );
}
