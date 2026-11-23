"use client";

import Link from "next/link";
import { AlertCircle, RotateCw } from "lucide-react";

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[70dvh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-subtle">
        <AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-ink">This page didn’t load</h1>
      <p className="mt-2 text-mist">
        Something went wrong while fetching it. Your progress is safe. Try again, or head back to your learning.
      </p>
      {error.digest && <p className="mt-3 font-mono text-xs text-mist">Reference {error.digest}</p>}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link href="/dashboard" className="btn btn-secondary">
          My learning
        </Link>
      </div>
    </main>
  );
}
