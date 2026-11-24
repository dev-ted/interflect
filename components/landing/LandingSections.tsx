"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { TUTOR } from "@/lib/auth";
import { PRO_ENABLED, TUTOR_ENABLED } from "@/convex/lib/features";
import { LogoMark } from "@/components/brand/Logo";
import { CourseCard, type CourseCardItem } from "./CourseCard";
import { GridBeams } from "./GridBeams";
import { StartLearning } from "./HeroShowcase";

/** Staggers items in a row of scroll reveals (see .reveal in globals.css). */
const revealAt = (i: number) => ({ "--reveal-i": i }) as CSSProperties;
const enterAt = (i: number) => ({ "--enter-i": i }) as CSSProperties;

/* ── Specimens: each skill shown as a small piece of real interface ───── */

function TypeSpecimen() {
  return (
    <div className="flex items-end gap-5 text-ink">
      {[
        ["56", "text-[3.5rem]"],
        ["40", "text-[2.5rem]"],
        ["24", "text-2xl"],
        ["16", "text-base"],
        ["12", "text-xs"],
      ].map(([size, cls]) => (
        <span key={size} className="flex flex-col items-center gap-2">
          <span className={`${cls} leading-none font-semibold tracking-tight`}>Aa</span>
          <span className="font-mono text-[10px] text-mist">{size}</span>
        </span>
      ))}
    </div>
  );
}

function SpacingSpecimen() {
  return (
    <div className="flex items-end gap-3">
      {[4, 8, 16, 24, 32].map((n) => (
        <span key={n} className="flex flex-col items-center gap-2">
          <span className="w-3 rounded-sm bg-accent/80" style={{ height: n * 2 }} />
          <span className="font-mono text-[10px] text-mist">{n}</span>
        </span>
      ))}
    </div>
  );
}

function FeedbackSpecimen() {
  return (
    <div className="flex flex-col gap-2">
      <span className="btn btn-secondary btn-sm pointer-events-none w-fit">
        <Loader2 className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        Saving
      </span>
      <span className="btn btn-primary btn-sm pointer-events-none w-fit">
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
        Saved
      </span>
    </div>
  );
}

function CodeSpecimen() {
  return (
    <pre className="rounded-[10px] border border-line bg-bg px-3 py-2.5 font-mono text-[11px] leading-relaxed text-mist">
      <span className="text-ink">&lt;button</span> <span className="text-accent-ink">type</span>=&quot;button&quot;
      {"\n"}  <span className="text-accent-ink">aria-pressed</span>={"{on}"}<span className="text-ink">&gt;</span>
      {"\n"}  Bold
      {"\n"}<span className="text-ink">&lt;/button&gt;</span>
    </pre>
  );
}

function TokenSpecimen() {
  return (
    <div className="flex flex-wrap gap-1.5">
      {["--space-4", "--radius-md", "--ink", "--accent"].map((t) => (
        <span key={t} className="chip font-mono text-[10px]">
          {t === "--accent" && <span className="h-2 w-2 rounded-full bg-accent" />}
          {t === "--ink" && <span className="h-2 w-2 rounded-full bg-ink" />}
          {t}
        </span>
      ))}
    </div>
  );
}

function CritiqueSpecimen() {
  const notes = [
    "Two bold weights fight for attention",
    "Grey on grey fails contrast at 2.1:1",
    "Gaps of 7, 12 and 19px, no scale",
  ];
  return (
    <div className="grid w-full gap-6 sm:grid-cols-[minmax(0,15rem)_1fr] sm:items-center">
      <div className="relative rounded-[10px] border border-line bg-bg p-4">
        <p className="text-sm font-black text-mist/70">Weekly report</p>
        <p className="mt-[7px] text-xs font-bold text-mist/50">Revenue is up this week</p>
        <div className="mt-[19px] h-10 rounded-sm bg-subtle" />
        {[
          ["top-3 -right-2", "1"],
          ["top-9 -left-2", "2"],
          ["bottom-6 -right-2", "3"],
        ].map(([pos, n]) => (
          <span
            key={n}
            className={`absolute ${pos} grid h-5 w-5 place-items-center rounded-full bg-coral font-mono text-[10px] font-semibold text-white`}
          >
            {n}
          </span>
        ))}
      </div>
      <ol className="space-y-2 text-sm text-ink">
        {notes.map((note, i) => (
          <li key={note} className="flex gap-3">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-coral font-mono text-[10px] text-coral">
              {i + 1}
            </span>
            {note}
          </li>
        ))}
      </ol>
    </div>
  );
}

const SKILLS = [
  {
    title: "UI design principles",
    body: "Hierarchy, type, colour and composition: why one screen feels calm and another feels noisy.",
    specimen: <TypeSpecimen />,
    span: "lg:col-span-2",
  },
  {
    title: "Spacing and layout",
    body: "One scale for every gap, so layouts read as a system.",
    specimen: <SpacingSpecimen />,
    span: "",
  },
  {
    title: "UX fundamentals",
    body: "Feedback, states and flows that tell people what just happened.",
    specimen: <FeedbackSpecimen />,
    span: "",
  },
  {
    title: "Frontend standards",
    body: "Semantic HTML, accessible components and CSS that stays maintainable.",
    specimen: <CodeSpecimen />,
    span: "",
  },
  {
    title: "Design systems",
    body: "Tokens and reusable components that keep a product consistent as it grows.",
    specimen: <TokenSpecimen />,
    span: "",
  },
  {
    title: "Interface evaluation",
    body: "Learn to review a screen like a senior designer: name what is wrong, explain why, and fix it.",
    specimen: <CritiqueSpecimen />,
    span: "lg:col-span-3",
  },
];

const STEPS = [
  {
    title: "Watch the lesson",
    body: "Short videos that show a real interface being reviewed and rebuilt, step by step.",
  },
  {
    title: "Read the notes",
    body: "Written notes with before-and-after examples and copy-ready code you can come back to.",
  },
  {
    title: "Check your judgement",
    body: "A short quiz on the decisions in the lesson, with an explanation for every answer.",
  },
];

const FREE = ["Every free course", "Preview lessons in Pro courses", "Notes, quizzes and progress tracking"];
const PRO = ["Every Pro course, including new ones", "The Interflect tutor on every lesson", "Quizzes made from what you are learning"];

export function LandingSections() {
  // Same args as the hero, so Convex shares one subscription.
  const courses = useQuery(api.courses.listPublished, {});
  const [featured, ...rest] = (courses ?? []) as CourseCardItem[];

  return (
    <>
      {/* What you'll learn: a modular grid, each cell a working specimen */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-24 sm:px-6">
        <div className="reveal max-w-2xl">
          <h2 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.035em] text-ink sm:text-[2.75rem]">
            The skills behind every good interface
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-mist">
            Not just which buttons to press in a design tool. The principles, standards and
            judgement that make an interface work.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {SKILLS.map((skill, i) => (
            <article
              key={skill.title}
              style={revealAt(i % 3)}
              className={`reveal card flex flex-col justify-between gap-8 p-6 sm:p-7 ${skill.span}`}
            >
              <div className="flex min-h-28 items-end" aria-hidden="true">
                {skill.specimen}
              </div>
              <div>
                <h3 className="text-base font-semibold text-ink">{skill.title}</h3>
                <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-mist">{skill.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Courses: one featured, the rest stacked beside it */}
      <section className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="reveal flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <h2 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
                Start with the fundamentals
              </h2>
              <p className="mt-3 text-mist">
                {PRO_ENABLED
                  ? "Begin with a free course, or try the preview lessons in any Pro course first."
                  : "Every course is free while Interflect is new. Pick one and start."}
              </p>
            </div>
            <Link href="/courses" className="btn btn-secondary">
              All courses
            </Link>
          </div>

          {/* The featured course runs full width; the rest sit in an even row below. */}
          <div className="reveal mt-10 grid gap-4 md:grid-cols-3">
            {courses === undefined ? (
              <>
                <div className="h-80 animate-pulse rounded-[14px] bg-subtle motion-reduce:animate-none md:col-span-3" />
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-[14px] bg-subtle motion-reduce:animate-none" />
                ))}
              </>
            ) : !featured ? (
              <p className="text-mist md:col-span-3">New courses are on the way.</p>
            ) : (
              <>
                <div className="enter md:col-span-3">
                  <CourseCard course={featured} wide />
                </div>
                {rest.slice(0, 3).map((course, i) => (
                  <div key={course._id} className="enter" style={enterAt(i + 1)}>
                    <CourseCard course={course} />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* How a lesson works: a real sequence, so it is numbered */}
      <section className="border-y border-line bg-subtle/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <h2 className="reveal max-w-xl text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
            How a lesson works
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} style={revealAt(i)} className="reveal border-t border-line pt-6 first:border-accent">
                <span className="font-mono text-xs text-mist tabular-nums">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-mist">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tutor (Pro) */}
      {TUTOR_ENABLED && (
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div className="max-w-md">
          {PRO_ENABLED && <span className="chip">Pro</span>}
          <h2 className="mt-4 text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.035em] text-ink">
            Ask why, not just how
          </h2>
          <p className="mt-4 leading-relaxed text-mist">
            The Interflect tutor knows the lesson you are on. Paste a screenshot description or a
            snippet and it explains what is working, what is not, and what to change.
          </p>
          {PRO_ENABLED ? (
            <Link href="/pricing" className="btn btn-primary mt-8">
              See Pro
            </Link>
          ) : (
            <div className="mt-8">
              <StartLearning className="btn btn-primary" />
            </div>
          )}
        </div>

        <figure className="card space-y-4 p-5 sm:p-6">
          <figcaption className="sr-only">Example conversation with the Interflect tutor</figcaption>
          <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-on-primary">
            My pricing card feels cluttered but I can’t say why.
          </p>
          <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-subtle px-4 py-3 text-sm leading-relaxed text-ink">
            Three things are competing: the price, the plan name and the badge are all bold. Keep
            weight only on the price, drop the badge to regular, and use 16px between groups
            instead of 12. The card will scan in one pass.
          </div>
          <div className="rounded-[14px] border border-line p-4">
            <p className="text-sm font-semibold text-ink">Quick check</p>
            <p className="mt-1 text-sm text-mist">What helps a card scan fastest?</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-[10px] border border-line px-3 py-2 text-mist">Make every label bold</li>
              <li className="flex items-center justify-between rounded-[10px] border border-accent px-3 py-2 text-ink">
                One clear focal point
                <Check className="h-4 w-4 text-accent-ink" aria-label="Correct" />
              </li>
            </ul>
          </div>
        </figure>
      </section>
      )}

      {/* Instructor */}
      <section className="border-t border-line">
        <div className="reveal mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[auto_1fr] md:gap-12">
          <Image
            src={TUTOR.avatar}
            alt={`Illustrated avatar of ${TUTOR.name}`}
            width={128}
            height={128}
            className="h-32 w-32 -rotate-3 rounded-2xl border border-line shadow-sm motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-[cubic-bezier(.23,1,.32,1)] hover:rotate-3 hover:scale-105"
          />
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink">Behind Interflect</h2>
            <p className="mt-1 text-sm text-mist">
              {TUTOR.name} <span className="font-mono text-accent-ink">“{TUTOR.nickname}”</span>, {TUTOR.role.toLowerCase()}
            </p>
            <p className="mt-5 text-xl leading-snug font-medium tracking-[-0.01em] text-ink">{TUTOR.tagline}</p>
            <p className="mt-3 text-lg leading-relaxed text-mist">{TUTOR.bio}</p>
            <a
              href={TUTOR.url}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink underline-offset-4 hover:underline"
            >
              frontendted.co.za
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Free vs Pro (hidden while everything is free) */}
      {PRO_ENABLED && (
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { name: "Free", price: "R0", items: FREE },
            { name: "Pro", price: "R50 a month", items: PRO },
          ].map((plan) => (
            <div key={plan.name} className="card p-6 sm:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-lg font-semibold text-ink">{plan.name}</h3>
                <span className="text-sm text-mist">{plan.price}</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-ink">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/pricing" className="mt-5 inline-block text-sm font-medium text-accent-ink underline-offset-4 hover:underline">
          Compare plans
        </Link>
      </section>
      )}

      {/* Closing panel */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="reveal night relative mx-auto max-w-6xl overflow-hidden rounded-[20px] px-6 py-16 sm:px-12 sm:py-20">
          <div className="bg-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden="true" />
          {/* Same fade as the grid but full strength, so the streaks glow on the right. Columns 9 and 12 cover phones. */}
          <div className="absolute inset-0 [mask-image:linear-gradient(to_left,black,transparent_70%)]" aria-hidden="true">
            <GridBeams rows={[[2, 7.5, 3.3], [3, 7, 1.2], [6, 6, 5.1], [9, 8.5, 4.4], [11, 7, 0.2], [13, 6.5, 2.6]]} cols={[[9, 7, 1.0], [12, 8, 3.9], [26, 7.5, 2.4], [30, 8, 0.5], [34, 6.5, 4.6], [38, 7, 3.7], [41, 8.5, 1.5], [44, 9, 5.9], [47, 7, 3.0]]} />
          </div>
          <LogoMark className="absolute -right-6 -bottom-10 hidden text-ink/90 sm:block sm:h-80 sm:w-80" />
          <div className="relative max-w-lg">
            <h2 className="text-[2.25rem] leading-[1.1] font-semibold tracking-[-0.035em] text-ink sm:text-[2.75rem]">
              Build your eye for good design.
            </h2>
            <p className="mt-4 text-mist">{PRO_ENABLED ? "Start with a free course. Go Pro when you want the full library." : "Every course is free. Sign up and start with the fundamentals."}</p>
            <div className="mt-8">
              <StartLearning className="btn btn-primary btn-lg" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
