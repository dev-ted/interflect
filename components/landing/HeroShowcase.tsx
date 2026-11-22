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
    tabBg: "bg-[#FF5A36] text-[#111116]",
    pillClass: "border-[#FF5A36] bg-[#FF5A36]/20 text-[#FF8B70]",
    title: "Adaptive 4K HLS Lessons & Free Previews",
    subtitle:
      "Every lesson streams over Mux with instant scrubbing, chapter markers, and free preview lessons inside Pro courses.",
  },
  {
    id: "markdown",
    label: "Rich Markdown",
    icon: Code2,
    badge: "Syntax Highlighted",
    tabBg: "bg-[#FFB800] text-[#111116]",
    pillClass: "border-[#FFB800] bg-[#FFB800]/20 text-[#FFD166]",
    title: "In-Depth Guides & Production Code Blocks",
    subtitle:
      "Follow alongside runnable TypeScript, Next.js 16, and Convex snippets with one-click copy and deep architecture notes.",
  },
  {
    id: "quiz",
    label: "Interactive Quizzes",
    icon: CheckCircle2,
    badge: "Active Recall",
    tabBg: "bg-[#00B87C] text-[#111116]",
    pillClass: "border-[#00B87C] bg-[#00B87C]/20 text-[#5EEAD4]",
    title: "Built-In Lesson Quizzes & Progress Tracking",
    subtitle:
      "Check your mastery right below each lesson with instant explanations and synced completion across every module.",
  },
  {
    id: "vukora",
    label: "Vukora AI Tutor",
    icon: Bot,
    badge: "Pro · Vercel Eve",
    tabBg: "bg-[#2563EB] text-white",
    pillClass: "border-[#3B82F6] bg-[#2563EB]/25 text-[#93C5FD]",
    title: "Context-Aware AI Tutor in Every Lesson",
    subtitle:
      "Vukora sees the exact lesson you're studying and every course you've completed — ready to explain code or quiz you live.",
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
    <section className="bg-studio-dots relative overflow-hidden border-b-2 border-[#18181B] bg-[#FFFBF2] dark:border-[#323244] dark:bg-[#0D0D12]">
      {/* Playful decorative corner shapes */}
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none absolute top-10 right-8 hidden h-20 w-20 text-[#FFB800]/55 lg:block dark:text-[#FFB800]/25"
      >
        <path
          fill="currentColor"
          d="M60 6l12 36 36 12-36 12-12 36-12-36-36-12 36-12z"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="pointer-events-none absolute bottom-8 left-6 hidden h-16 w-16 text-[#00B87C]/35 lg:block dark:text-[#10D394]/20"
      >
        <circle cx="60" cy="60" r="44" fill="none" stroke="currentColor" strokeWidth="10" strokeDasharray="16 14" />
      </svg>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 py-14 sm:px-6 sm:py-22 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-6">
          <div className="inline-flex -rotate-1 items-center gap-2 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-3.5 py-1 text-xs font-extrabold text-[#111116] shadow-[3px_3px_0_0_#111116] dark:border-[#18181B]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Hands-On Engineering Studio · By Sonny Sangha
          </div>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-[#111116] sm:text-5xl lg:text-[3.45rem] lg:leading-[1.04] dark:text-[#FAFAF5]">
            Master modern full-stack &amp; AI engineering —{" "}
            <span className="relative inline-block text-[#D93817] dark:text-[#FF6B4A]">
              lesson by lesson.
              <svg
                aria-hidden="true"
                viewBox="0 0 280 18"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -bottom-2 left-0 h-3 w-full text-[#FFB800]"
              >
                <path
                  d="M3 13 C 55 3, 115 17, 175 7 S 245 14, 277 6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[#52525B] sm:text-lg dark:text-[#B4B4C6]">
            Structured courses built around crisp Mux 4K video lessons, rich
            markdown code guides, interactive quizzes, and{" "}
            <strong className="rounded-md bg-[#2563EB]/12 px-1.5 py-0.5 font-bold text-[#1D4ED8] dark:bg-[#3B82F6]/20 dark:text-[#93C5FD]">
              Vukora
            </strong>{" "}
            — your Pro AI tutor that knows your exact lesson and progress.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <Link
              href="/courses"
              className="tactile-btn inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#FF5A36] px-6 py-3 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              Explore Courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/pricing"
              className="tactile-btn inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#2563EB] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              <Crown className="h-4 w-4 text-[#FFB800]" aria-hidden="true" />
              Unlock Pro · 2 Months Free
            </Link>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-2xl border-2 border-[#18181B] bg-white p-3.5 shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[3px_3px_0_0_#000000]">
              <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#52525B] uppercase dark:text-[#B4B4C6]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#00B87C]" />
                Free Previews
              </dt>
              <dd className="font-display mt-1 text-lg font-extrabold text-[#111116] sm:text-xl dark:text-[#FAFAF5]">
                Try First
              </dd>
            </div>
            <div className="rounded-2xl border-2 border-[#18181B] bg-white p-3.5 shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[3px_3px_0_0_#000000]">
              <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#52525B] uppercase dark:text-[#B4B4C6]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#FF5A36]" />
                Video Engine
              </dt>
              <dd className="font-display mt-1 text-lg font-extrabold text-[#111116] sm:text-xl dark:text-[#FAFAF5]">
                Mux 4K
              </dd>
            </div>
            <div className="rounded-2xl border-2 border-[#18181B] bg-white p-3.5 shadow-[3px_3px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[3px_3px_0_0_#000000]">
              <dt className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-[#52525B] uppercase dark:text-[#B4B4C6]">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#2563EB]" />
                AI Companion
              </dt>
              <dd className="font-display mt-1 text-lg font-extrabold text-[#111116] sm:text-xl dark:text-[#FAFAF5]">
                Vukora
              </dd>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-6">
          <div className="relative">
            {/* Playful corner sticker */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-3.5 right-6 z-10 rotate-2 rounded-full border-2 border-[#18181B] bg-[#00B87C] px-3 py-0.5 font-mono text-[11px] font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]"
            >
              LIVE WORKBENCH
            </span>

            <div className="overflow-hidden rounded-3xl border-2 border-[#18181B] bg-[#14141D] text-[#FAFAF5] shadow-[8px_8px_0_0_#111116] dark:border-[#3A3A52] dark:shadow-[8px_8px_0_0_#000000]">
              <div className="flex items-center justify-between border-b-2 border-[#2A2A3B] bg-[#1B1B27] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-3 w-3 rounded-full border border-black/40 bg-[#FF5A36]" />
                  <span aria-hidden="true" className="h-3 w-3 rounded-full border border-black/40 bg-[#FFB800]" />
                  <span aria-hidden="true" className="h-3 w-3 rounded-full border border-black/40 bg-[#00B87C]" />
                  <span className="ml-2 rounded-md bg-[#111119] px-2 py-0.5 font-mono text-xs text-[#B4B4C6]">
                    vukora.studio/{activeSlide.id}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPaused((p) => !p)}
                  className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg border-2 border-[#3A3A52] bg-[#14141D] px-2.5 py-1 text-xs font-bold text-[#FAFAF5] transition-colors hover:border-[#FFB800] hover:text-[#FFB800] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB800]"
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

              <div className="grid grid-cols-4 gap-1 border-b-2 border-[#2A2A3B] bg-[#111119] p-1.5 text-xs">
                {SLIDES.map((slide, idx) => {
                  const Icon = slide.icon;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={slide.id}
                      type="button"
                      aria-label={slide.label}
                      aria-current={isActive ? "true" : undefined}
                      onClick={() => setActiveIndex(idx)}
                      className={`flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-2 py-2 font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFB800] sm:min-h-9 ${
                        isActive
                          ? `${slide.tabBg} border-2 border-[#111116] shadow-[2px_2px_0_0_#000000]`
                          : "border-2 border-transparent text-[#B4B4C6] hover:bg-[#1B1B27] hover:text-white"
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

              <div className="min-h-[320px] p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${activeSlide.pillClass}`}
                  >
                    {activeSlide.badge}
                  </span>
                  <span className="rounded-md bg-[#1F1F2D] px-2 py-0.5 font-mono text-xs font-semibold text-[#B4B4C6]">
                    0{activeIndex + 1} / 0{SLIDES.length}
                  </span>
                </div>

                <h2 className="font-display text-lg font-extrabold text-[#FAFAF5] sm:text-xl">
                  {activeSlide.title}
                </h2>
                <p className="mt-1 text-sm text-[#B4B4C6]">
                  {activeSlide.subtitle}
                </p>

                <div className="mt-5">
                  {activeSlide.id === "video" && (
                    <div className="rounded-2xl border-2 border-[#2A2A3B] bg-[#1B1B27] p-4">
                      <div className="relative flex aspect-[16/7] items-center justify-center overflow-hidden rounded-xl border border-[#323244] bg-gradient-to-br from-[#2B1815] via-[#1B1B27] to-[#122620]">
                        <div
                          className={`flex h-13 w-13 items-center justify-center rounded-2xl border-2 border-[#111116] bg-[#FF5A36] text-[#111116] shadow-[4px_4px_0_0_#000000] animate-float-gentle ${
                            paused ? "animation-paused" : ""
                          }`}
                        >
                          <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />
                        </div>
                        <span className="absolute top-2.5 left-2.5 rounded-full border border-[#111116] bg-[#00B87C] px-2.5 py-0.5 text-[11px] font-extrabold text-[#111116]">
                          Free Preview
                        </span>
                        <span className="absolute right-2.5 bottom-2.5 rounded-lg border border-[#3A3A52] bg-[#111119]/90 px-2 py-0.5 font-mono text-[11px] font-semibold text-[#FAFAF5]">
                          12:20 · 1080p HLS
                        </span>
                      </div>
                      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full border border-[#323244] bg-[#111119]">
                        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-[#FF5A36] to-[#FFB800]" />
                      </div>
                    </div>
                  )}

                  {activeSlide.id === "markdown" && (
                    <div className="rounded-2xl border-2 border-[#2A2A3B] bg-[#101018] p-4 font-mono text-xs leading-6 text-[#FAFAF5]">
                      <div className="mb-2 flex items-center justify-between border-b border-[#242436] pb-2 text-[11px] text-[#B4B4C6]">
                        <span>convex/auth.config.ts</span>
                        <span className="rounded-md bg-[#FFB800]/20 px-2 py-0.5 font-bold text-[#FFB800]">
                          TypeScript
                        </span>
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
                    <div className="space-y-2.5 rounded-2xl border-2 border-[#2A2A3B] bg-[#1B1B27] p-4 text-xs">
                      <p className="font-bold text-[#FAFAF5]">
                        Which claim links Clerk sessions directly to Convex?
                      </p>
                      <div className="flex items-center justify-between rounded-xl border-2 border-[#00B87C] bg-[#00B87C]/15 px-3 py-2 font-semibold text-[#7EE2B8]">
                        <span>✓ aud: &quot;convex&quot; in the signed Clerk JWT</span>
                        <span className="rounded-full bg-[#00B87C] px-2 py-0.5 text-[10px] font-extrabold text-[#111116]">
                          +100 XP
                        </span>
                      </div>
                      <div className="rounded-xl border border-[#323244] bg-[#14141D] px-3 py-2 text-[#B4B4C6]">
                        Passing userId directly as a mutation argument
                      </div>
                    </div>
                  )}

                  {activeSlide.id === "vukora" && (
                    <div className="space-y-3 rounded-2xl border-2 border-[#2563EB]/60 bg-[#1B1B27] p-4 text-xs">
                      <div className="flex items-center gap-2 text-[#93C5FD]">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#2563EB] text-white">
                          <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        <span className="font-bold text-white">Vukora AI Tutor</span>
                        <span className="rounded-full bg-[#FFB800] px-2 py-0.5 text-[10px] font-extrabold text-[#111116]">
                          Context: Lesson 2
                        </span>
                      </div>
                      <p className="leading-relaxed text-[#D8D8E6]">
                        You finished{" "}
                        <span className="font-bold text-white">Cache Components</span>! Want
                        a quick 3-question quiz on{" "}
                        <span className="font-mono text-[#FFB800]">proxy.ts</span> before
                        moving to Convex auth?
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-lg border border-[#111116] bg-[#FF5A36] px-2.5 py-1 font-extrabold text-[#111116]">
                          Quiz me now
                        </span>
                        <span className="rounded-lg border border-[#3A3A52] bg-[#14141D] px-2.5 py-1 font-semibold text-[#FAFAF5]">
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
      </div>
    </section>
  );
}
