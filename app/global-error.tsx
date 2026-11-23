"use client";

import { AlertCircle, RotateCw } from "lucide-react";
import { StatusPage } from "@/components/status/StatusPage";
import "./globals.css";

/** Replaces the root layout when it fails, so it brings its own <html> and <body>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-bg text-ink">
        <title>Something went wrong | Interflect</title>
        <StatusPage
          code="500"
          icon={<AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />}
          title="Interflect is having trouble"
          actions={
            <>
              <button type="button" onClick={reset} className="btn btn-primary">
                <RotateCw className="h-4 w-4" aria-hidden="true" />
                Try again
              </button>
              {/* The app shell itself failed, so do a full page load rather than a client navigation. */}
              <button type="button" onClick={() => window.location.assign("/")} className="btn btn-secondary">
                Home
              </button>
            </>
          }
        >
          <p>Something broke while loading the app. Your progress is saved. Try again, or reload the home page.</p>
          {error.digest && <p className="mt-3 font-mono text-xs">Reference {error.digest}</p>}
        </StatusPage>
      </body>
    </html>
  );
}
