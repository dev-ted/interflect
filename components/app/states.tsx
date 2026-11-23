"use client";

import { Component, useState, type ReactNode } from "react";
import Link from "next/link";
import { AlertCircle, RotateCw } from "lucide-react";

/** A placeholder block. Size it with classes: <Skeleton className="h-4 w-32" />. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/** A card-shaped placeholder that matches a widget's footprint, so nothing jumps when data arrives. */
export function WidgetSkeleton({ className = "", lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={`card flex flex-col gap-4 p-6 ${className}`} role="status" aria-label="Loading">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-24" />
      <div className="mt-auto space-y-2">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-line px-6 py-8 text-center">
      {icon && <span className="mb-1 text-mist" aria-hidden="true">{icon}</span>}
      <p className="text-sm font-medium text-ink">{title}</p>
      {body && <p className="max-w-[36ch] text-sm text-mist">{body}</p>}
      {action && (
        <Link href={action.href} className="btn btn-secondary btn-sm mt-2">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ what, onRetry }: { what: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex h-full flex-col items-center justify-center gap-2 px-6 py-8 text-center">
      <AlertCircle className="h-5 w-5 text-danger" aria-hidden="true" />
      <p className="text-sm font-medium text-ink">Couldn’t load {what}.</p>
      <p className="max-w-[36ch] text-sm text-mist">Check your connection and try again.</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn btn-secondary btn-sm mt-2">
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          Try again
        </button>
      )}
    </div>
  );
}

class Boundary extends Component<
  { children: ReactNode; fallback: (retry: () => void) => ReactNode; onRetry: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[widget]", error);
  }
  render() {
    return this.state.failed ? this.props.fallback(this.props.onRetry) : this.props.children;
  }
}

/**
 * Wrap each widget so one failing query never breaks the page.
 * "Try again" remounts the widget, which resubscribes its Convex query.
 */
export function WidgetBoundary({
  what,
  className = "",
  children,
}: {
  what: string;
  className?: string;
  children: ReactNode;
}) {
  const [attempt, setAttempt] = useState(0);
  return (
    <Boundary
      key={attempt}
      onRetry={() => setAttempt((n) => n + 1)}
      fallback={(retry) => (
        <div className={`card ${className}`}>
          <ErrorState what={what} onRetry={retry} />
        </div>
      )}
    >
      {children}
    </Boundary>
  );
}
