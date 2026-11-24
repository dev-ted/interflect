"use client";

import Link from "next/link";
import { SignUpButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CritiqueSlider } from "./CritiqueSlider";
import { GridBeams } from "./GridBeams";

// Gridline index, seconds per pass, start delay. Uneven numbers so the passes never sync up.
const HERO_ROWS: [number, number, number][] = [[2, 8.5, 2.3], [4, 7, 0.4], [8, 6.5, 4.9], [11, 9, 3.1], [15, 7.5, 1.1], [19, 8, 5.6], [24, 9.5, 2.8]];
const HERO_COLS: [number, number, number][] = [[5, 9, 3.6], [9, 8, 1.8], [17, 7, 5.2], [27, 10, 4.2], [35, 8.5, 0.2], [46, 7.5, 0.9], [54, 9, 3.3], [63, 9.5, 6.3], [71, 8, 2.1]];

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

  return (
    <section className="relative overflow-x-clip">
      {/* The layout grid the page is built on, faded out toward the edges. */}
      <div
        className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black,transparent)]"
        aria-hidden="true"
      >
        <GridBeams rows={HERO_ROWS} cols={HERO_COLS} />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-4 pt-16 pb-12 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:pt-24 lg:pb-16">
        <div>
          <h1 className="text-[3rem] leading-[0.98] font-semibold tracking-[-0.045em] text-ink sm:text-[4.5rem]">
            Think better.
            <br />
            Design better.
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-mist">
            Learn why some interfaces work and others don’t, then build them
            properly. Layout, type, colour, accessibility and the frontend that
            holds it together.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <StartLearning />
            <Link href="/courses" className="btn btn-secondary btn-lg">
              Browse courses
            </Link>
          </div>
          <p className="mt-8 min-h-5 text-sm text-mist" aria-live="polite">
            {courses && courses.length > 0 &&
              `${plural(courses.length, "course")} and ${plural(lessonTotal, "lesson")}, free to start.`}
          </p>
        </div>

        <CritiqueSlider />
      </div>
    </section>
  );
}
