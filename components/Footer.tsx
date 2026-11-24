import Link from "next/link";
import { PRO_ENABLED } from "@/convex/lib/features";
import { Logo } from "@/components/brand/Logo";
import { CookieSettingsButton } from "@/components/consent/CookieConsent";

const LINKS = [
  { href: "/courses", label: "Courses" },
  ...(PRO_ENABLED ? [{ href: "/pricing", label: "Pricing" }] : []),
  { href: "/dashboard", label: "My learning" },
  { href: "/brand", label: "Brand" },
];

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs space-y-3">
          <Logo />
          <p className="text-sm text-mist">
            Think better. Design better. Courses in UI design, UX and the frontend craft that holds it together.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-mist">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-ink">
              {l.label}
            </Link>
          ))}
          <CookieSettingsButton />
        </nav>
      </div>
      <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 border-t border-line px-4 py-5 text-xs text-mist sm:px-6">
        <span>© Interflect</span>
        <span>
          Crafted by{" "}
          <a
            href="https://frontendted.co.za/"
            target="_blank"
            rel="noopener"
            className="font-semibold text-ink underline-offset-4 hover:underline"
          >
            ted.code
          </a>
        </span>
      </div>
    </footer>
  );
}
