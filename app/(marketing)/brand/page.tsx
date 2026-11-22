import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BookOpen, Check, Layers, LayoutGrid, MousePointerClick, Search, Type } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/brand/ThemeToggle";

export const metadata: Metadata = {
  title: "Brand",
  description: "Interflect brand guidelines: logo, colour, type, graphic language, UI and voice.",
};

function Section({ id, title, intro, children }: { id: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="border-t border-line py-16">
      <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
        <div>
          <h2 id={`${id}-h`} className="text-xl font-semibold tracking-[-0.03em] text-ink">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-mist">{intro}</p>
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function Panel({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <figure className="min-w-0">
      <div className={`grid min-h-40 place-items-center rounded-[14px] border border-line p-6 ${className}`}>{children}</div>
      <figcaption className="mt-2 text-xs text-mist">{label}</figcaption>
    </figure>
  );
}

const COLOURS = [
  { name: "Ink", token: "--ink", cls: "bg-ink", light: "#171717", dark: "#FAFAFA", rgb: "23 23 23", use: "Text and primary buttons. 17.9:1 on white." },
  { name: "Paper", token: "--bg", cls: "bg-bg", light: "#FFFFFF", dark: "#0A0A0A", rgb: "255 255 255", use: "Page background." },
  { name: "Mist", token: "--mist", cls: "bg-mist", light: "#737373", dark: "#A3A3A3", rgb: "115 115 115", use: "Secondary text. 4.7:1 on white (AA)." },
  { name: "Line", token: "--line", cls: "bg-line", light: "#E5E5E5", dark: "#FFFFFF 10%", rgb: "229 229 229", use: "Borders, dividers and the layout grid." },
  { name: "Reflect teal", token: "--accent", cls: "bg-accent", light: "#14B8A6", dark: "#2DD4BF", rgb: "20 184 166", use: "Fills, focus, progress, the symbol. 2.5:1 on white: graphics only." },
  { name: "Teal text", token: "--accent-ink", cls: "bg-accent-ink", light: "#0F766E", dark: "#2DD4BF", rgb: "15 118 110", use: "Links and accent text on light. 5.5:1 (AA)." },
  { name: "Coral", token: "--coral", cls: "bg-coral", light: "#F25F5C", dark: "#FF7A78", rgb: "242 95 92", use: "Rare highlights and redlines. Never body text." },
];

const STATUS = [
  { name: "Success", cls: "bg-success", light: "#16A34A", dark: "#4ADE80" },
  { name: "Warning", cls: "bg-warning", light: "#D97706", dark: "#FBBF24" },
  { name: "Danger", cls: "bg-danger", light: "#DC2626", dark: "#F87171" },
];

const TYPE = [
  { role: "Display", size: 72, cls: "text-[4.5rem] font-semibold tracking-[-0.045em] leading-none" },
  { role: "H1", size: 56, cls: "text-[3.5rem] font-semibold tracking-[-0.04em] leading-none" },
  { role: "H2", size: 40, cls: "text-[2.5rem] font-semibold tracking-[-0.035em] leading-tight" },
  { role: "H3", size: 24, cls: "text-2xl font-semibold tracking-[-0.03em]" },
  { role: "Body large", size: 18, cls: "text-lg" },
  { role: "Body", size: 16, cls: "text-base" },
  { role: "Small", size: 14, cls: "text-sm" },
  { role: "Label", size: 12, cls: "text-xs font-medium" },
];

function Misuse({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure>
      <div className="relative grid h-28 place-items-center rounded-[14px] border border-line bg-surface">
        {children}
        <span className="absolute top-2 right-2 grid h-5 w-5 place-items-center rounded-full bg-danger text-xs font-semibold text-white" aria-hidden="true">
          ✕
        </span>
      </div>
      <figcaption className="mt-2 text-xs text-mist">{label}</figcaption>
    </figure>
  );
}

export default function BrandPage() {
  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-16 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-6 pb-12">
        <div className="max-w-2xl">
          <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.04em] text-ink sm:text-[3.5rem]">
            Interflect brand guidelines
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-mist">
            Interflect joins <em>interface</em> and <em>reflection</em>: looking past the surface of a
            design to understand why it works. The identity is built to show the standards we teach:
            a clear grid, one spacing scale, careful type and a single accent.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-mist">
          Preview in
          <ThemeToggle />
        </div>
      </header>

      <Section id="logo" title="Logo" intro="A custom wordmark and a standalone symbol. The ink bar is the interface; the teal bar is its reflection, offset half a bar down.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Panel label="Primary lockup on paper" className="bg-bg">
            <Logo className="scale-150" />
          </Panel>
          <Panel label="Primary lockup on ink" className="night">
            <Logo className="scale-150" />
          </Panel>
          <Panel label="Symbol at 48, 32 and 16px" className="bg-surface">
            <div className="flex items-end gap-6 text-ink">
              <LogoMark className="h-12 w-12" />
              <LogoMark className="h-8 w-8" />
              <LogoMark className="h-4 w-4" />
            </div>
          </Panel>
          <Panel label="Mono, for one-colour print and embossing" className="bg-surface">
            <Logo mono className="scale-150" />
          </Panel>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Panel label="Construction: two 6×12 bars, radius 3, on a 24px grid" className="bg-surface">
            <div className="relative h-40 w-40 text-ink">
              <div className="bg-grid absolute inset-0 rounded-md [background-size:calc(100%/24)_calc(100%/24)]" aria-hidden="true" />
              <LogoMark className="relative h-40 w-40" />
            </div>
          </Panel>
          <Panel label="Clear space: one bar width (x) on every side. Minimum size: 16px symbol, 88px lockup." className="bg-surface">
            <div className="relative border border-dashed border-coral p-5">
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[10px] text-coral">x</span>
              <span className="absolute top-1/2 -left-4 -translate-y-1/2 font-mono text-[10px] text-coral">x</span>
              <Logo />
            </div>
          </Panel>
        </div>

        <h3 className="mt-12 text-sm font-semibold text-ink">Incorrect use</h3>
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Misuse label="Don’t colour both bars teal">
            <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden="true">
              <rect x="5" y="3" width="6" height="12" rx="3" fill="var(--accent)" />
              <rect x="13" y="9" width="6" height="12" rx="3" fill="var(--accent)" />
            </svg>
          </Misuse>
          <Misuse label="Don’t stretch or squash">
            <svg viewBox="0 0 24 24" preserveAspectRatio="none" className="h-12 w-24" aria-hidden="true">
              <rect x="5" y="3" width="6" height="12" rx="3" fill="var(--ink)" />
              <rect x="13" y="9" width="6" height="12" rx="3" fill="var(--accent)" />
            </svg>
          </Misuse>
          <Misuse label="Don’t flip the reflection upward">
            <svg viewBox="0 0 24 24" className="h-12 w-12" aria-hidden="true">
              <rect x="5" y="9" width="6" height="12" rx="3" fill="var(--ink)" />
              <rect x="13" y="3" width="6" height="12" rx="3" fill="var(--accent)" />
            </svg>
          </Misuse>
          <Misuse label="Don’t add shadows or gradients">
            <LogoMark className="h-12 w-12 text-ink drop-shadow-[3px_4px_2px_rgb(0_0_0/0.45)]" />
          </Misuse>
        </div>
      </Section>

      <Section id="colour" title="Colour" intro="A neutral base for clean learning screens, one vivid teal for recognition and a rare coral for emphasis. Every value has a light and a dark version.">
        <div className="grid gap-3">
          {COLOURS.map((c) => (
            <div key={c.token} className="grid items-center gap-4 rounded-[14px] border border-line p-3 sm:grid-cols-[4.5rem_1fr_auto]">
              <span className={`h-14 rounded-[10px] border border-line ${c.cls}`} aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-ink">
                  {c.name} <span className="font-mono text-xs font-normal text-mist">{c.token}</span>
                </p>
                <p className="mt-0.5 text-sm text-mist">{c.use}</p>
              </div>
              <dl className="grid grid-cols-3 gap-x-4 font-mono text-xs text-mist sm:text-right">
                <div><dt className="sr-only">Light</dt><dd>{c.light}</dd></div>
                <div><dt className="sr-only">Dark</dt><dd>{c.dark}</dd></div>
                <div><dt className="sr-only">RGB</dt><dd>rgb {c.rgb}</dd></div>
              </dl>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {STATUS.map((s) => (
            <div key={s.name} className="rounded-[14px] border border-line p-3">
              <span className={`block h-8 rounded-[8px] ${s.cls}`} aria-hidden="true" />
              <p className="mt-2 text-sm font-medium text-ink">{s.name}</p>
              <p className="font-mono text-xs text-mist">{s.light} / {s.dark}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-[65ch] text-sm leading-relaxed text-mist">
          Proportion: about 90% neutrals, 8% ink, 2% teal. Coral appears at most once per screen.
          Teal text uses <code className="font-mono text-xs">--accent-ink</code> on light backgrounds so it passes AA.
        </p>
      </Section>

      <Section id="type" title="Typography" intro="Instrument Sans for everything you read, set tight in headings and relaxed in body text. JetBrains Mono only for code and measurements.">
        <div className="divide-y divide-line rounded-[14px] border border-line">
          {TYPE.map((t) => (
            <div key={t.role} className="flex items-baseline gap-6 overflow-hidden px-5 py-4">
              <span className="w-20 shrink-0 font-mono text-xs text-mist">{t.size}px</span>
              <span className={`truncate text-ink ${t.cls}`}>{t.role}: Think better</span>
            </div>
          ))}
          <div className="flex items-baseline gap-6 px-5 py-4">
            <span className="w-20 shrink-0 font-mono text-xs text-mist">14px</span>
            <code className="font-mono text-sm text-ink">gap: var(--space-4);</code>
          </div>
        </div>
        <p className="mt-4 text-sm text-mist">Body text: 16–18px, line height 1.6, at most 65 characters per line.</p>
      </Section>

      <Section id="graphics" title="Graphic language" intro="Taken from design tools: a quiet layout grid, alignment guides, spacing redlines and layered panels. It shows the structure behind the surface.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Panel label="Layout grid, 24px" className="bg-grid bg-surface">
            <span className="sr-only">Grid pattern</span>
          </Panel>
          <Panel label="Redlines label real spacing" className="bg-surface">
            <div className="flex items-center gap-2">
              <span className="h-10 w-10 rounded-[8px] bg-subtle" />
              <span className="flex flex-col items-center">
                <span className="font-mono text-[10px] text-coral">16</span>
                <span className="h-px w-4 bg-coral" />
              </span>
              <span className="h-10 w-10 rounded-[8px] bg-subtle" />
            </div>
          </Panel>
          <Panel label="Layering: one step of depth at a time" className="bg-subtle">
            <div className="relative h-20 w-28">
              <span className="absolute inset-0 translate-x-3 translate-y-3 rounded-[10px] border border-line bg-bg" />
              <span className="card absolute inset-0" />
            </div>
          </Panel>
        </div>
      </Section>

      <Section id="icons" title="Icons and imagery" intro="Lucide icons at 16, 20 or 24px with a 1.5–2px stroke, in ink or mist. Imagery is abstract interface compositions, not stock photos.">
        <div className="flex flex-wrap gap-3">
          {[LayoutGrid, Type, Layers, MousePointerClick, Search, BookOpen].map((Icon, i) => (
            <span key={i} className="grid h-12 w-12 place-items-center rounded-[10px] border border-line text-ink">
              <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
          ))}
        </div>
        <ul className="mt-6 max-w-[65ch] space-y-2 text-sm leading-relaxed text-mist">
          <li>Course art: real UI fragments (a type scale, spacing marks, a focus ring) on the grid, one accent.</li>
          <li>Photography, when needed: real people at real work, natural light, screens visible. No posed stock, no lightbulbs, books or graduation caps.</li>
        </ul>
      </Section>

      <Section id="ui" title="UI components" intro="Pill buttons, 10px fields, 14px cards. One primary action per view.">
        <div className="flex flex-wrap items-center gap-3">
          <span className="btn btn-primary">Primary</span>
          <span className="btn btn-secondary">Secondary</span>
          <span className="btn btn-ghost">Ghost</span>
          <span className="btn btn-accent">Accent</span>
          <span className="chip">Badge</span>
          <span className="chip bg-accent/15 text-accent-ink">Pro</span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input className="field mt-1.5" placeholder="you@studio.com" readOnly aria-readonly="true" />
          </label>
          <div className="card p-5">
            <p className="text-xs text-mist">Lesson 2 of 6</p>
            <p className="mt-1 font-semibold text-ink">Contrast you can measure</p>
            <div className="mt-4 h-1.5 rounded-full bg-subtle"><div className="h-full w-2/5 rounded-full bg-accent" /></div>
          </div>
        </div>
      </Section>

      <Section id="social" title="Social" intro="Profile image: the symbol on ink, 400×400. Cover: 1500×500, tagline left, the grid behind.">
        <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
          <Panel label="Avatar, 400×400" className="night aspect-square min-h-0">
            <LogoMark className="h-16 w-16 text-ink" />
          </Panel>
          <Panel label="Cover, 1500×500" className="night relative aspect-[3/1] min-h-0 place-items-start overflow-hidden">
            <div className="bg-grid absolute inset-0 opacity-50" aria-hidden="true" />
            <div className="relative self-center">
              <Logo />
              <p className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink sm:text-2xl">Think better. Design better.</p>
            </div>
          </Panel>
        </div>
      </Section>

      <Section id="motion" title="Motion" intro="Motion answers what someone did. One orchestrated moment per page, everything else is quiet.">
        <ul className="max-w-[65ch] space-y-2 text-sm leading-relaxed text-ink">
          <li><span className="font-mono text-xs text-mist">--ease-out</span> cubic-bezier(.23, 1, .32, 1) for entering and responding.</li>
          <li><span className="font-mono text-xs text-mist">--ease-in-out</span> cubic-bezier(.77, 0, .175, 1) for things moving on screen.</li>
          <li>150–250ms for UI. Buttons press to 0.97. Popovers scale from their trigger, from 0.95.</li>
          <li>Signature: the before/after slider sweeps once on the home page. With reduced motion it stays still.</li>
        </ul>
      </Section>

      <Section id="voice" title="Voice" intro="A knowledgeable designer who enjoys sharing what they know: clear, practical, curious.">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Learn why the layout works, then build it.", "Unlock your creative superpowers today!"],
            ["Spacing that feels intentional", "SPACING THAT FEELS INTENTIONAL!!"],
            ["Save changes", "Submit"],
            ["Contrast is 2.1:1. Use mist on white for 4.7:1.", "Oops! Something looks off."],
          ].map(([good, bad]) => (
            <div key={good} className="rounded-[14px] border border-line p-4 text-sm">
              <p className="flex gap-2 text-ink"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />{good}</p>
              <p className="mt-2 flex gap-2 text-mist line-through decoration-danger/60"><span className="w-4 shrink-0 text-center text-danger" aria-hidden="true">✕</span>{bad}</p>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
