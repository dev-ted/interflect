"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Code2,
  Crown,
  Layers,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { TUTOR } from "@/lib/auth";
import { CourseCard, type CourseCardItem } from "./CourseCard";

const COURSE_FEATURES = [
  {
    step: "01",
    icon: PlayCircle,
    accentBg: "bg-[#FF5A36] text-[#111116]",
    title: "Mux Adaptive HD Video",
    description:
      "Every lesson is delivered via Video.js 10 + Mux streaming with instant seek, crisp 1080p/4K playback, and free preview lessons so you can test Pro courses first.",
  },
  {
    step: "02",
    icon: Code2,
    accentBg: "bg-[#FFB800] text-[#111116]",
    title: "Deep Markdown & Code Blocks",
    description:
      "Accompanying each video is an engineering-grade written guide packed with syntax-highlighted code blocks, architecture diagrams, and copy-ready snippets.",
  },
  {
    step: "03",
    icon: CheckCircle2,
    accentBg: "bg-[#00B87C] text-[#111116]",
    title: "Interactive Quizzes & Progress",
    description:
      "Verify retention immediately with interactive multiple-choice quizzes, detailed explanations, lesson completion checkmarks, and a personal learning dashboard.",
  },
  {
    step: "04",
    icon: Bot,
    accentBg: "bg-[#2563EB] text-white",
    title: "Vukora Context-Aware AI Tutor",
    description:
      "Pro members unlock Vukora in the bottom-right corner — secured by Clerk, aware of the exact lesson you're viewing, your completed courses, and able to quiz you on demand.",
  },
];

export function LandingSections() {
  const courses = useQuery(api.courses.listPublished, { limit: 6 });

  return (
    <>
      {/* Available Courses */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="scroll-reveal flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#00B87C] px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#111116] uppercase shadow-[2px_2px_0_0_#111116]">
              Curriculum Catalog
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111116] sm:text-4xl dark:text-[#FAFAF5]">
              Courses built to ship real apps
            </h2>
            <p className="mt-2 max-w-2xl text-base text-[#52525B] dark:text-[#B4B4C6]">
              Start immediately with free courses — or sample free preview
              lessons inside any Pro track before upgrading.
            </p>
          </div>
          <Link
            href="/courses"
            className="tactile-btn-sm inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-[#111116] hover:bg-[#FFB800] dark:bg-[#16161F] dark:text-[#FAFAF5] dark:hover:bg-[#FFB800] dark:hover:text-[#111116]"
          >
            View all courses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="scroll-reveal mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {courses === undefined
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-[410px] animate-pulse rounded-2xl border-2 border-[#18181B]/20 bg-[#F6EFE0] dark:border-[#323244] dark:bg-[#16161F]"
                />
              ))
            : courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course as CourseCardItem}
                />
              ))}
        </div>
      </section>

      {/* What Each Course Offers */}
      <section className="bg-studio-grid border-y-2 border-[#18181B] bg-[#F6EFE0]/85 py-20 dark:border-[#323244] dark:bg-[#12121A]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-3 py-0.5 text-xs font-extrabold tracking-wide text-[#111116] uppercase shadow-[2px_2px_0_0_#111116]">
              What&apos;s Inside Every Course
            </span>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111116] sm:text-4xl dark:text-[#FAFAF5]">
              Not just passive videos — an active coding studio
            </h2>
            <p className="mt-3 text-base text-[#52525B] dark:text-[#B4B4C6]">
              Every course is structured into focused modules and hands-on
              lessons designed for retention, real-world architecture, and rapid
              shipping.
            </p>
          </div>

          <div className="scroll-reveal mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {COURSE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="tactile-card tactile-card-interactive flex flex-col rounded-2xl p-6"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0_0_#111116] ${feature.accentBg}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs font-bold text-[#52525B] dark:text-[#B4B4C6]">
                      {feature.step}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet the Tutor — Sonny Sangha */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="tactile-card-lg scroll-reveal overflow-hidden rounded-3xl p-7 sm:p-12">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#18181B] bg-[#14141D] p-8 text-[#FAFAF5] shadow-[5px_5px_0_0_#FF5A36] dark:border-[#3A3A52]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 80 80"
                  className="pointer-events-none absolute top-4 right-4 h-12 w-12 text-[#FFB800]"
                >
                  <path
                    fill="currentColor"
                    d="M40 4l8 24 24 8-24 8-8 24-8-24-24-8 24-8z"
                  />
                </svg>
                <div className="flex h-16 w-16 -rotate-3 items-center justify-center rounded-2xl border-2 border-[#111116] bg-[#FF5A36] font-display text-2xl font-extrabold text-[#111116] shadow-[3px_3px_0_0_#000000]">
                  SS
                </div>
                <p className="font-display mt-6 text-2xl font-extrabold tracking-tight">
                  {TUTOR.name}
                </p>
                <p className="mt-1 text-sm font-medium text-[#93C5FD]">
                  {TUTOR.role}
                </p>
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#FFB800]/50 bg-[#FFB800]/15 px-3 py-1 text-xs font-bold text-[#FFB800]">
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                  {TUTOR.handle}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#2563EB] px-3 py-0.5 text-xs font-extrabold tracking-wide text-white uppercase shadow-[2px_2px_0_0_#111116]">
                Your Instructor
              </span>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#111116] sm:text-4xl dark:text-[#FAFAF5]">
                Learn directly from {TUTOR.name}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                {TUTOR.bio} Every module in Vukora Studio is authored,
                recorded, and curated directly — no filler, no outdated
                boilerplates, only production stacks you can deploy today.
              </p>

            </div>
          </div>
        </div>
      </section>

      {/* Pro Upgrade Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="scroll-reveal relative overflow-hidden rounded-3xl border-2 border-[#18181B] bg-[#14141D] px-7 py-14 text-[#FAFAF5] shadow-[8px_8px_0_0_#FF5A36] sm:px-14 dark:border-[#3A3A52]">
          <svg
            aria-hidden="true"
            viewBox="0 0 140 140"
            className="pointer-events-none absolute -top-6 -right-6 h-40 w-40 text-[#FFB800]/20"
          >
            <path
              fill="currentColor"
              d="M70 8l14 42 42 14-42 14-14 42-14-42-42-14 42-14z"
            />
          </svg>
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex -rotate-1 items-center gap-1.5 rounded-full border-2 border-[#111116] bg-[#FFB800] px-3.5 py-1 text-xs font-extrabold text-[#111116] shadow-[3px_3px_0_0_#000000]">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Yearly Plan · 2 Months Free
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Ready for every Pro course &amp; Vukora AI?
              </h2>
              <p className="mt-3 text-base text-[#D4D4E2]">
                Unlock the entire Pro library, full Mux HD video tracks, and
                your personal context-aware Vukora AI tutor with interactive
                quizzes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                href="/pricing"
                className="tactile-btn inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#FF5A36] px-6 py-3.5 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
              >
                <Crown className="h-4 w-4" aria-hidden="true" />
                See Pro Pricing
              </Link>
              <Link
                href="/courses"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-[#4A4A62] bg-[#1F1F2D] px-6 py-3.5 text-sm font-bold text-[#FAFAF5] shadow-[3px_3px_0_0_#000000] transition-colors hover:border-[#00B87C] hover:text-[#7EE2B8]"
              >
                Try Free Previews
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
