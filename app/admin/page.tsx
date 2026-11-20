import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, ShieldAlert, Terminal } from "lucide-react";
import { getServerAuthContext } from "@/lib/server-auth";
import { AdminStudioClient } from "@/components/admin/AdminStudioClient";

export const metadata: Metadata = {
  title: "Admin Studio | Learnly Studio",
  description:
    "Manage courses, curriculum modules, Mux video uploads, Markdown notes, and quizzes.",
};

export default async function AdminPage() {
  const { isAuthenticated, userId, isAdmin } = await getServerAuthContext();

  if (!isAuthenticated) {
    await auth.protect();
  }

  if (!isAdmin) {
    const cliCommand = `clerk api -X PATCH /users/${userId}/metadata -d '{"public_metadata":{"role":"admin"}}'`;

    return (
      <main className="mx-auto flex max-w-2xl flex-1 items-center px-4 py-16 sm:px-6">
        <div className="tactile-card-lg w-full rounded-3xl p-7 sm:p-8">
          <div className="flex h-12 w-12 -rotate-3 items-center justify-center rounded-2xl border-2 border-[#18181B] bg-[#FFB800] text-[#111116] shadow-[3px_3px_0_0_#111116]">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-[#111116] dark:text-[#FAFAF5]">
            Admin Access Required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
            Your signed-in account does not have the{" "}
            <code className="rounded-md border border-[#18181B]/20 bg-[#F6EFE0] px-1.5 py-0.5 font-mono text-xs font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
              admin
            </code>{" "}
            role in Clerk <code className="font-mono text-xs">publicMetadata</code>{" "}
            yet.
          </p>

          <div className="mt-5 rounded-2xl border-2 border-[#18181B]/25 bg-[#F6EFE0]/80 p-4 dark:border-[#3A3A52] dark:bg-[#12121A]">
            <div className="text-xs font-extrabold uppercase tracking-wide text-[#52525B] dark:text-[#B4B4C6]">
              Your Clerk User ID
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-[#111116] select-all dark:text-[#FAFAF5]">
              {userId}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#52525B] dark:text-[#B4B4C6]">
              <Terminal className="h-3.5 w-3.5 text-[#D93817] dark:text-[#FF6B4A]" aria-hidden="true" />
              Option 1 — Grant via Clerk CLI (1 command)
            </div>
            <pre className="overflow-x-auto rounded-2xl border-2 border-[#18181B] bg-[#12121A] p-4 font-mono text-xs leading-relaxed text-[#FAFAF5] shadow-[3px_3px_0_0_#111116] select-all dark:border-[#3A3A52] dark:shadow-[3px_3px_0_0_#000000]">
              <code>{cliCommand}</code>
            </pre>

            <div className="rounded-2xl border-2 border-dashed border-[#18181B]/30 bg-[#FFFBF2] p-4 text-xs leading-relaxed text-[#52525B] dark:border-[#3A3A52] dark:bg-[#12121A] dark:text-[#B4B4C6]">
              <strong className="font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                Option 2 — Clerk Dashboard:
              </strong>{" "}
              Open <strong>Clerk Dashboard → Users → Public metadata</strong>{" "}
              and set{" "}
              <code className="rounded-md border border-[#18181B]/20 bg-[#F6EFE0] px-1.5 py-0.5 font-mono text-[11px] font-bold text-[#111116] dark:border-[#3A3A52] dark:bg-[#1F1F2D] dark:text-[#FAFAF5]">
                {`{"role": "admin"}`}
              </code>
              , then sign out and sign back in (or refresh your session).
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/courses"
              className="tactile-btn inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#FF5A36] px-4 py-2 text-xs font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Courses
            </Link>
            <Link
              href="/dashboard"
              className="tactile-btn-sm inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-[#111116] hover:bg-[#FFB800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] dark:bg-[#1F1F2D] dark:text-[#FAFAF5] dark:hover:bg-[#FFB800] dark:hover:text-[#111116]"
            >
              Go to My Learning
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1">
      <AdminStudioClient />
    </main>
  );
}
