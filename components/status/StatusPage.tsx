import type { ReactNode } from "react";

/** Shared layout for 404 and error screens, so every failure looks like part of the app. */
export function StatusPage({
  code,
  icon,
  title,
  children,
  actions,
}: {
  code?: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-[70dvh] w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      {code && (
        <p className="font-mono text-sm tracking-[0.2em] text-mist" aria-hidden="true">
          {code}
        </p>
      )}
      <span className="mt-4 grid h-12 w-12 place-items-center rounded-full bg-subtle">{icon}</span>
      <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-ink text-balance">{title}</h1>
      <div className="mt-2 text-mist text-pretty">{children}</div>
      <div className="mt-7 flex flex-wrap justify-center gap-3">{actions}</div>
    </main>
  );
}
