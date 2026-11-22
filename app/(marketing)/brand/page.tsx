import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";

export const metadata: Metadata = {
  title: "Brand | Vukora",
  description: "The Vukora brand guide: idea, logo, colour, type, components, motion and voice.",
};

// The hex values document app/globals.css; the swatches themselves render from the live tokens.
const COLORS = [
  { name: "bg", swatch: "bg-bg", day: "#F6F7FB", night: "#0B1033", use: "Page background" },
  { name: "surface", swatch: "bg-surface", day: "#FFFFFF", night: "#131A45", use: "Cards and panels" },
  { name: "subtle", swatch: "bg-subtle", day: "#EEF0F7", night: "#1A2255", use: "Tracks, hovers, chips" },
  { name: "ink", swatch: "bg-ink", day: "#0F1436", night: "#EEF0FA", use: "Text" },
  { name: "mist", swatch: "bg-mist", day: "#5B6283", night: "#A3A9C9", use: "Secondary text" },
  { name: "line", swatch: "bg-line", day: "#E3E6F0", night: "#252D5E", use: "Borders" },
  { name: "primary", swatch: "bg-primary", day: "#2F45E0", night: "#7C8CFF", use: "Actions and links (Vuka Blue)" },
  { name: "sun", swatch: "bg-sun", day: "#FFB52E", night: "#FFC24D", use: "Logo sun, progress, Pro. Once per view." },
  { name: "sage", swatch: "bg-sage", day: "#3F8F6B", night: "#5FC096", use: "Completed and correct" },
  { name: "danger", swatch: "bg-danger", day: "#D93D42", night: "#FF6B6F", use: "Errors" },
];

const TYPE_SCALE = [61, 49, 39, 31, 25, 20, 16, 14, 12];

const VOICE = [
  { do: "Start learning", dont: "Get Started Now →" },
  { do: "Mark complete", dont: "LESSON COMPLETED!" },
  { do: "12 lessons in 3 modules", dont: "10,000+ happy learners" },
  { do: "Video, notes and a quiz in every lesson", dont: "Video · Notes · Quizzes" },
];

function Section({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <section className="border-t border-line py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_3fr]">
        <div>
          <h2 className="text-[1.563rem] font-bold text-ink">{title}</h2>
          {intro && <p className="mt-2 text-sm leading-relaxed text-mist">{intro}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

export default function BrandPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-6 py-16 lg:py-24">
        <div className="max-w-2xl">
          <h1 className="text-[2.441rem] leading-tight font-extrabold text-ink sm:text-[3.052rem]">
            Vukora brand guide
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            <em className="font-semibold text-ink not-italic">Vuka</em> is isiZulu and
            isiXhosa for wake up, or rise. Learning is waking up: day mode is the
            day, dark mode is the night, and the gold sun is the only loud thing
            on the page. Everything here renders from the live tokens, so switch
            the theme to see both.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Section
        title="Logo"
        intro="A thick rounded V in Vuka Blue cradling a rising sun. Keep clear space equal to the sun's diameter on every side. Minimum size: 16px for the mark, 96px wide for the lockup."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card flex h-40 items-center justify-center text-ink">
            <Logo />
          </div>
          <div className="night flex h-40 items-center justify-center rounded-xl border border-line">
            <Logo />
          </div>
          <div className="card flex h-40 items-center justify-center gap-8 text-ink">
            <LogoMark className="h-12 w-12" />
            <LogoMark className="h-6 w-6" />
            <LogoMark className="h-4 w-4" />
          </div>
          <div className="flex h-40 items-center justify-center gap-8 rounded-xl bg-sun text-on-sun">
            <Logo mono />
            <LogoMark mono className="h-8 w-8" />
          </div>
        </div>
        <p className="mt-4 text-sm text-mist">
          Lockup on the current theme, on night, the mark at three sizes, and the
          mono version for single-colour use. Never recolour the sun, stretch the
          mark or set the wordmark in capitals.
        </p>
      </Section>

      <Section
        title="Colour"
        intro="Use the token utilities (bg-surface, text-mist, border-line). They swap per theme, so per-theme overrides are almost never needed. Wrap a region in the night class to render it on the night palette in both modes."
      >
        <ul className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {COLORS.map((c) => (
            <li key={c.name} className="flex items-center gap-4">
              <span className={`h-14 w-14 shrink-0 rounded-xl border border-line ${c.swatch}`} />
              <div className="min-w-0 text-sm">
                <p className="font-semibold text-ink">{c.name}</p>
                <p className="text-mist">{c.use}</p>
                <p className="mt-0.5 font-mono text-xs text-mist">
                  Day {c.day}, night {c.night}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Type"
        intro="One family, Schibsted Grotesk. Headings at 700 to 800 with -0.02em tracking, body at 400 to 500. A major third scale. Keep lines under 70 characters. JetBrains Mono is for code only."
      >
        <ul className="space-y-4">
          {TYPE_SCALE.map((size) => (
            <li key={size} className="flex items-baseline gap-6 overflow-hidden">
              <span className="w-10 shrink-0 text-xs text-mist tabular-nums">{size}px</span>
              <span
                className={`truncate text-ink ${size >= 25 ? "font-extrabold tracking-[-0.02em]" : ""}`}
                style={{ fontSize: size }}
              >
                Rise by building
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Components"
        intro="Radius follows hierarchy: 6px for controls, 12px for cards, 24px only for hero panels, pills only for chips and avatars."
      >
        <div className="space-y-8">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-primary">Primary</button>
            <button type="button" className="btn btn-secondary">Secondary</button>
            <button type="button" className="btn btn-ghost">Ghost</button>
            <button type="button" className="btn btn-sun">Sun</button>
            <button type="button" className="btn btn-primary btn-sm">Small</button>
            <button type="button" className="btn btn-primary btn-lg">Large</button>
            <button type="button" className="btn btn-primary" disabled>Disabled</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">Beginner</span>
            <span className="chip text-sage">Free</span>
            <span className="chip text-ink">3 free previews</span>
          </div>
          <div className="grid max-w-md gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Email
              <input type="email" className="field" placeholder="you@example.com" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-ink">
              Notes
              <textarea className="field" rows={3} placeholder="What clicked in this lesson?" />
            </label>
          </div>
          <div className="card max-w-md p-5">
            <p className="font-semibold text-ink">Card</p>
            <p className="mt-1 text-sm text-mist">
              Surface, a 1px line and a soft tinted shadow in day. In night, depth
              comes from the lighter surface, not a shadow.
            </p>
          </div>
        </div>
      </Section>

      <Section
        title="Motion"
        intro="Motion explains, it never decorates. Only transform and opacity, and everything collapses to a fade under reduced motion."
      >
        <div className="grid gap-8 md:grid-cols-[1fr_auto]">
          <ul className="space-y-3 text-sm leading-relaxed text-ink">
            <li><span className="font-semibold">Easing:</span> <code className="font-mono text-xs">--ease-out</code> cubic-bezier(0.23, 1, 0.32, 1) for entrances, <code className="font-mono text-xs">--ease-in-out</code> cubic-bezier(0.77, 0, 0.175, 1) for moves.</li>
            <li><span className="font-semibold">Durations:</span> 160ms for presses and colour, 220ms for popovers, 320ms at most for anything in the UI.</li>
            <li><span className="font-semibold">Press:</span> buttons scale to 0.97. Popups scale from 0.95 with opacity, from their trigger, never from 0.</li>
            <li><span className="font-semibold">Hover:</span> only on devices that can hover, and on colour more than movement.</li>
            <li><span className="font-semibold">The one moment:</span> the sun rises behind the landing hero once, 900ms. Nothing else moves on its own.</li>
          </ul>
          <div className="night relative h-40 w-full overflow-hidden rounded-xl md:w-56" aria-hidden="true">
            <div className="sun-rise absolute -bottom-10 left-1/2 -ml-14 h-28 w-28 rounded-full bg-sun" />
          </div>
        </div>
      </Section>

      <Section
        title="Voice"
        intro="Plain, sentence case, active verbs. No all-caps labels, no middle-dot strings, no arrows glued to links, no emoji, and no numbers we cannot back with real data."
      >
        <div className="overflow-hidden rounded-xl border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-subtle text-mist">
              <tr>
                <th scope="col" className="px-4 py-2.5 font-semibold">Write</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Not</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-surface">
              {VOICE.map((v) => (
                <tr key={v.do}>
                  <td className="px-4 py-3 text-ink">{v.do}</td>
                  <td className="px-4 py-3 text-mist line-through decoration-danger">{v.dont}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </main>
  );
}
