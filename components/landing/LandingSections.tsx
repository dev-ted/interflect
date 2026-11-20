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
    icon: PlayCircle,
    title: "Mux Adaptive HD Video",
    description:
      "Every lesson is delivered via Video.js 10 + Mux streaming with instant seek, crisp 1080p/4K playback, and free preview lessons so you can test Pro courses first.",
  },
  {
    icon: Code2,
    title: "Deep Markdown & Code Blocks",
    description:
      "Accompanying each video is an engineering-grade written guide packed with syntax-highlighted code blocks, architecture diagrams, and copy-ready snippets.",
  },
  {
    icon: CheckCircle2,
    title: "Interactive Quizzes & Progress",
    description:
      "Verify retention immediately with interactive multiple-choice quizzes, detailed explanations, lesson completion checkmarks, and a personal learning dashboard.",
  },
  {
    icon: Bot,
    title: "Learnly Context-Aware AI Tutor",
    description:
      "Pro members unlock Learnly in the bottom-right corner — secured by Clerk, aware of the exact lesson you're viewing, your completed courses, and able to quiz you on demand.",
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
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              Curriculum Catalog
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Courses built to ship real apps
            </h2>
            <p className="mt-2 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
              Start immediately with free courses — or sample free preview
              lessons inside any Pro track before upgrading.
            </p>
          </div>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition-colors hover:text-indigo-500 dark:text-indigo-400"
          >
            View all courses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="scroll-reveal mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses === undefined
            ? Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`skeleton-${i}`}
                  className="h-[400px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
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
      <section className="border-y border-zinc-200/80 bg-zinc-50/80 py-20 dark:border-zinc-800/80 dark:bg-zinc-900/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="scroll-reveal max-w-2xl">
            <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
              What&apos;s Inside Every Course
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
              Not just passive videos — an active coding studio
            </h2>
            <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
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
                  className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-zinc-950 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet the Tutor — Teddy */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="scroll-reveal overflow-hidden rounded-3xl border border-zinc-200/90 bg-white p-8 sm:p-12 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-indigo-600 via-indigo-700 to-zinc-950 p-8 text-white dark:border-zinc-700">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur-sm">
                  SS
                </div>
                <p className="mt-6 text-2xl font-bold tracking-tight">
                  {TUTOR.name}
                </p>
                <p className="mt-1 text-sm text-indigo-200">{TUTOR.role}</p>
                <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-indigo-100">
                  <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                  {TUTOR.tagline}
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400">
                Your Instructor
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl dark:text-white">
                Learn directly from {TUTOR.name}
              </h2>
              <p className="mt-4 text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                {TUTOR.bio} Every module in Learnly Studio is authored,
                recorded, and curated directly — no filler, no outdated boilerplates,
                only production stacks you can deploy today.
              </p>

              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                {TUTOR.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {stat.label}
                    </dt>
                    <dd className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Pro Upgrade Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <div className="scroll-reveal relative overflow-hidden rounded-3xl bg-zinc-950 px-8 py-14 text-white sm:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl"
          />
          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Yearly Plan · 2 Months Free
              </span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Ready for every Pro course &amp; Learnly AI?
              </h2>
              <p className="mt-3 text-base text-zinc-300">
                Unlock the entire Pro library, full Mux HD video tracks, and
                your personal context-aware Learnly AI tutor with interactive
                quizzes.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
              >
                <Crown className="h-4 w-4" aria-hidden="true" />
                See Pro Pricing
              </Link>
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3.5 text-sm font-semibold text-zinc-100 transition-colors hover:bg-zinc-800"
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
