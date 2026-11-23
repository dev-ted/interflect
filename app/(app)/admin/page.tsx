import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ShieldAlert } from "lucide-react";
import { getServerAuthContext } from "@/lib/server-auth";
import { AdminStudioClient } from "@/components/admin/AdminStudioClient";

export const metadata: Metadata = {
  title: "Admin studio",
  description:
    "Manage courses, modules, Mux video uploads, lesson notes and quizzes.",
};

export default async function AdminPage() {
  const { isAuthenticated, userId, isAdmin } = await getServerAuthContext();

  if (!isAuthenticated) {
    await auth.protect();
  }

  if (!isAdmin) {
    const cliCommand = `clerk api -X PATCH /users/${userId}/metadata -d '{"public_metadata":{"role":"admin"}}'`;

    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:py-20">
        <div className="card p-6 sm:p-8">
          <ShieldAlert className="h-6 w-6 text-mist" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-extrabold">
            You need admin access for the studio
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Your account doesn&apos;t have the{" "}
            <code className="font-mono text-ink">admin</code> role in its Clerk
            public metadata yet. Add it one of two ways, then sign out and back
            in.
          </p>

          <h2 className="mt-6 text-sm font-semibold">With the Clerk CLI</h2>
          <pre className="mt-2 overflow-x-auto rounded-[10px] border border-line bg-subtle p-4 text-ink font-mono text-xs leading-relaxed select-all">
            <code>{cliCommand}</code>
          </pre>

          <h2 className="mt-6 text-sm font-semibold">In the Clerk dashboard</h2>
          <p className="mt-1 text-sm leading-relaxed text-mist">
            Open Users, choose your account and set its public metadata to{" "}
            <code className="rounded bg-subtle px-1.5 py-0.5 font-mono text-xs text-ink">
              {`{"role": "admin"}`}
            </code>
            .
          </p>

          <p className="mt-6 text-sm text-mist">
            Your user ID:{" "}
            <span className="font-mono text-xs break-all text-ink select-all">
              {userId}
            </span>
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link href="/dashboard" className="btn btn-primary">
              Go to my learning
            </Link>
            <Link href="/courses" className="btn btn-secondary">
              Browse courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
      <AdminStudioClient />
    </main>
  );
}
