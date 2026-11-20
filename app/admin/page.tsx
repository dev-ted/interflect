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
        <div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/70">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" aria-hidden="true" />
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Admin Access Required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your signed-in account does not have the{" "}
            <code className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
              admin
            </code>{" "}
            role in Clerk <code className="font-mono text-xs">publicMetadata</code>{" "}
            yet.
          </p>

          <div className="mt-5 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Your Clerk User ID
            </div>
            <p className="mt-1 font-mono text-sm font-medium text-zinc-950 select-all dark:text-zinc-50">
              {userId}
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
              <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
              Option 1 — Grant via Clerk CLI (1 command)
            </div>
            <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#0d1117] p-4 font-mono text-xs leading-relaxed text-zinc-100 select-all">
              <code>{cliCommand}</code>
            </pre>

            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 text-xs leading-relaxed text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-400">
              <strong className="font-semibold text-zinc-900 dark:text-zinc-200">
                Option 2 — Clerk Dashboard:
              </strong>{" "}
              Open <strong>Clerk Dashboard → Users → Public metadata</strong>{" "}
              and set{" "}
              <code className="rounded bg-zinc-200/80 px-1.5 py-0.5 font-mono text-[11px] text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                {`{"role": "admin"}`}
              </code>
              , then sign out and sign back in (or refresh your session).
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/courses"
              className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-950 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to Courses
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
