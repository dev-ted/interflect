import Link from "next/link";
import type { ReactNode } from "react";

// Every legal page points people here.
export const CONTACT_EMAIL = "devted19@gmail.com";
export const LAST_UPDATED = "28 November 2026";

const DOCS = [
  { href: "/terms", label: "Terms of service" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/cookies", label: "Cookie policy" },
] as const;

export function Email() {
  return <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;
}

/** Shared shell for the legal documents: title, date, sibling links and readable prose. */
export function LegalPage({
  current,
  title,
  intro,
  children,
}: {
  current: (typeof DOCS)[number]["href"];
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <nav aria-label="Legal documents" className="mb-10 flex flex-wrap gap-2 text-sm">
        {DOCS.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            aria-current={d.href === current ? "page" : undefined}
            className="rounded-full border border-line px-3 py-1 text-mist hover:text-ink aria-[current=page]:bg-subtle aria-[current=page]:text-ink"
          >
            {d.label}
          </Link>
        ))}
      </nav>

      <h1 className="text-4xl font-semibold tracking-[-0.04em] text-ink sm:text-5xl">{title}</h1>
      <p className="mt-3 font-mono text-xs text-mist">Last updated {LAST_UPDATED}</p>
      <p className="mt-6 text-lg leading-relaxed text-mist text-pretty">{intro}</p>

      <div className="mt-12 max-w-[65ch] leading-relaxed text-ink [&_a]:text-accent-ink [&_a]:underline [&_a]:underline-offset-4 [&_code]:break-all[&_h2]:mt-12 [&_h2]:scroll-mt-24 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h3]:mt-6 [&_h3]:font-semibold [&_li]:mt-2 [&_p]:mt-4 [&_strong]:font-semibold [&_table]:mt-4 [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_table]:text-left [&_table]:text-sm [&_td]:border-t [&_td]:border-line [&_td]:py-2 [&_td]:pr-4 [&_td]:align-top [&_th]:py-2 [&_th]:pr-4 [&_th]:font-medium [&_th]:text-mist [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
        {children}
      </div>
    </main>
  );
}
