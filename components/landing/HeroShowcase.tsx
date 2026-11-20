"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Crown,
  Pause,
  Play,
  PlayCircle,
  Sparkles,
} from "lucide-react";

const SLIDES = [
  {
    id: "video",
    label: "Mux HD Video",
    icon: PlayCircle,
    badge: "Video.js 10 + Mux",
    title: "Adaptive 4K HLS Lessons & Free Previews",
    subtitle:
      "Every lesson streams over Mux with instant scrubbing, chapter markers, and free preview lessons inside Pro courses.",
  },
  {
    id: "markdown",
    label: "Rich Markdown",
    icon: Code2,
    badge: "Syntax Highlighted",
    title: "In-Depth Guides & Production Code Blocks",
    subtitle:
      "Follow alongside runnable TypeScript, Next.js 16, and Convex snippets with one-click copy and deep architecture notes.",
  },
  {
    id: "quiz",
    label: "Interactive Quizzes",
    icon: CheckCircle2,
    badge: "Active Recall",
    title: "Built-In Lesson Quizzes & Progress Tracking",
    subtitle:
      "Check your mastery right below each lesson with instant explanations and synced completion across every module.",
  },
  {
    id: "learnly",
    label: "Learnly AI Tutor",
    icon: Bot,
    badge: "Pro · Vercel Eve",
    title: "Context-Aware AI Tutor in Every Lesson",
    subtitle:
      "Learnly sees the exact lesson you're studying and every course you've completed — ready to explain code or quiz you live.",
  },
] as const;

export function HeroShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const activeSlide = SLIDES[activeIndex];

  return (
    <section className="relative overflow-hidden border-b border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(79,70,229,0.12),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.18),_transparent_55%)]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Hands-On Engineering Courses by Sonny Sangha
          </div>

          <h1 className="mt-5 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08] dark:text-white">
            Master modern full-stack &amp; AI engineering —{" "}
            <span className="text-indigo-600 dark:text-indigo-400">
              lesson by lesson.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-600 sm:text-lg dark:text-zinc-400">
            Structured courses built around deep Mux video lessons, rich
            markdown code guides, interactive quizzes, and{" "}
            <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
              Learnly
            </strong>{" "}
            — your Pro AI tutor that knows your exact lesson and progress.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50/70 px-5 py-3 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100/80 dark:border-indigo-800/70 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950"
            >
              <Crown className="h-4 w-4" aria-hidden="true" />
              Unlock Pro · 2 Months Free Yearly
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-zinc-200/80 pt-6 dark:border-zinc-800">
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Free Previews
              </dt>
              <dd className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">
                Try First
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                Video Engine
              </dt>
              <dd className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">
                Mux 4K
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                AI Companion
              </dt>
              <dd className="mt-1 text-xl font-bold text-zinc-950 dark:text-white">
                Learnly
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-zinc-950 text-zinc-50 shadow-2xl shadow-indigo-950/15 dark:border-zinc-800">
            <div className="flex items-center justify-between border-b border-zinc-800/90 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-xs text-zinc-400">
                  learnly.studio / {activeSlide.id}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white"
              >
                {paused ? (
                  <>
                    <Play className="h-3 w-3" aria-hidden="true" />
                    Play
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3" aria-hidden="true" />
                    Pause
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 border-b border-zinc-800/90 bg-zinc-900/60 p-1.5 text-xs">
              {SLIDES.map((slide, idx) => {
                const Icon = slide.icon;
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 py-2 font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span className="hidden truncate sm:inline">
                      {slide.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="min-h-[310px] p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-medium text-indigo-300">
                  {activeSlide.badge}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  0{activeIndex + 1} / 0{SLIDES.length}
                </span>
              </div>

              <h2 className="text-lg font-semibold text-white">
                {activeSlide.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                {activeSlide.subtitle}
              </p>

              <div className="mt-5">
                {activeSlide.id === "video" && (
                  <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
                    <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-950">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 animate-float-gentle ${
                          paused ? "animation-paused" : ""
                        }`}
                      >
                        <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="absolute top-2.5 left-2.5 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                        Free Preview
                      </span>
                      <span className="absolute right-2.5 bottom-2.5 rounded-md bg-zinc-950/80 px-2 py-0.5 font-mono text-[11px] text-zinc-300">
                        12:20 · 1080p HLS
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div className="h-full w-2/3 rounded-full bg-indigo-500" />
                    </div>
                  </div>
                )}

                {activeSlide.id === "markdown" && (
                  <div className="rounded-xl border border-zinc-800 bg-[#0d1117] p-4 font-mono text-xs leading-6 text-zinc-200">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>convex/auth.config.ts</span>
                      <span className="text-emerald-400">TypeScript</span>
                    </div>
                    <pre className="overflow-x-auto">
                      <code>{`export default {
  providers: [{
    domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
    applicationID: "convex",
  }],
} satisfies AuthConfig;`}</code>
                    </pre>
                  </div>
                )}

                {activeSlide.id === "quiz" && (
                  <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4 text-xs">
                    <p className="font-medium text-zinc-100">
                      Which claim links Clerk sessions directly to Convex?
                    </p>
                    <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3 py-2 text-emerald-200">
                      ✓ aud: &quot;convex&quot; in the signed Clerk JWT
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-zinc-400">
                      Passing userId directly as a mutation argument
                    </div>
                  </div>
                )}

                {activeSlide.id === "learnly" && (
                  <div className="space-y-2.5 rounded-xl border border-indigo-500/30 bg-zinc-900/90 p-4 text-xs">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Bot className="h-4 w-4" aria-hidden="true" />
                      <span className="font-semibold">Learnly AI Tutor</span>
                      <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px]">
                        Context: Lesson 2
                      </span>
                    </div>
                    <p className="leading-relaxed text-zinc-300">
                      You finished{" "}
                      <span className="text-white">Cache Components</span>! Want
                      a quick 3-question quiz on{" "}
                      <span className="text-indigo-300">proxy.ts</span> before
                      moving to Convex auth?
                    </p>
                    <div className="flex gap-2">
                      <span className="rounded-md bg-indigo-600 px-2.5 py-1 font-medium text-white">
                        Quiz me now
                      </span>
                      <span className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300">
                        Suggest next lesson
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
