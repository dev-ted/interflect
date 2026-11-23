"use client";

import Link from "next/link";
import { AlertCircle, RotateCw } from "lucide-react";
import { StatusPage } from "@/components/status/StatusPage";

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <StatusPage
      code="500"
      icon={<AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />}
      title="Something went wrong"
      actions={
        <>
          <button type="button" onClick={reset} className="btn btn-primary">
            <RotateCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link href="/" className="btn btn-secondary">
            Home
          </Link>
        </>
      }
    >
      <p>This page hit an error on our side. Try again in a moment.</p>
      {error.digest && <p className="mt-3 font-mono text-xs">Reference {error.digest}</p>}
    </StatusPage>
  );
}
