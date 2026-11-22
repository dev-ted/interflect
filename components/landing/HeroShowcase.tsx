"use client";

import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { CheckCircle2, Play } from "lucide-react";
import { api } from "@/convex/_generated/api";

/** Primary CTA: sign-up modal when signed out, the dashboard when signed in. */
export function StartLearning({ className = "btn btn-primary btn-lg" }: { className?: string }) {
  return (
    <>
      <Unauthenticated>
        <SignUpButton mode="modal">
          <button type="button" className={className}>
            Start learning
          </button>
        </SignUpButton>
      </Unauthenticated>
      <Authenticated>
        <Link href="/dashboard" className={className}>
          Continue learning
        </Link>
      </Authenticated>
    </>
  );
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function HeroShowcase() {
  const courses = useQuery(api.courses.listPublished, {});
  const lessonTotal = courses?.reduce((n, c) => n + c.lessonCount, 0) ?? 0;
  const featured = courses?.[0];
  const done = featured ? Math.min(3, featured.lessonCount) : 0;
  const pct = featured?.lessonCount ? Math.round((done / featured.lessonCount) * 100) : 0;

  return (
    <section className="overflow-x-clip">
      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-32">
        <div className="max-w-xl">
          <h1 className="text-[2.441rem] leading-[1.05] font-extrabold text-ink sm:text-[3.815rem]">
            Rise by building real software.
          </h1>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-mist">
            Watch the lesson, read the notes, check yourself with a quiz, and
            ship a working app by the end of every course.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <StartLearning />
            <Link href="/courses" className="btn btn-secondary btn-lg">
              Browse courses
            </Link>
          </div>
          <p className="mt-8 min-h-5 text-sm text-mist" aria-live="polite">
            {courses && courses.length > 0 &&
              `${plural(courses.length, "course")} and ${plural(lessonTotal, "lesson")} live now.`}
          </p>
        </div>

        {/* Product composite on the night palette, with the sun rising behind it. */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none" aria-hidden="true">
          <div className="sun-rise absolute -top-16 -right-10 h-64 w-64 rounded-full bg-sun shadow-[0_0_120px_40px_var(--sun)] sm:h-80 sm:w-80" />

          <div className="night relative rounded-3xl border border-night-line p-5 sm:p-6">
            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="relative aspect-video bg-subtle">
                {featured?.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={featured.thumbnailUrl} alt="" className="h-full w-full object-cover opacity-80" />
                )}
                <span className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary">
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
              </div>
              <div className="p-4">
                <p className="text-xs text-mist">Lesson 1</p>
                <p className="mt-1 truncate font-semibold text-ink">
                  {featured?.title ?? "Your first lesson"}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl border border-line bg-surface p-4">
              <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--line)" strokeWidth="4" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke="var(--sun)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  pathLength="100"
                  strokeDasharray={`${pct} 100`}
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-ink">
                  {featured ? `${done} of ${plural(featured.lessonCount, "lesson")} done` : "Your progress"}
                </p>
                <p className="mt-0.5 text-xs text-mist">Picks up where you left off</p>
              </div>
            </div>

            <span className="chip absolute -bottom-3 left-8 h-8 border border-line bg-surface px-3 text-sm text-ink shadow-card">
              <CheckCircle2 className="h-4 w-4 text-sage" />
              Quiz passed, 3 of 3
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
