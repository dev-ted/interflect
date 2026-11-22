"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { Check, Crown, ExternalLink } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { TUTOR } from "@/lib/auth";
import { CourseCard, type CourseCardItem } from "./CourseCard";
import { StartLearning } from "./HeroShowcase";

const STEPS = [
  {
    title: "Watch the video",
    body: "Short, focused lessons streamed in HD. Scrub back to any moment and code along at your own pace.",
  },
  {
    title: "Read the notes",
    body: "Every video comes with written notes and copy-ready code, so you can revisit a lesson without rewatching it.",
  },
  {
    title: "Check yourself with a quiz",
    body: "A few questions at the end of each lesson, with an explanation for every answer. Then mark it complete.",
  },
];

const FREE = ["Every free course", "Preview lessons inside Pro courses", "Notes, quizzes and progress tracking"];
const PRO = ["Every Pro course and future course", "The Vukora AI tutor on every lesson", "Quizzes generated from where you are"];

export function LandingSections() {
  // Same args as the hero, so Convex shares one subscription.
  const courses = useQuery(api.courses.listPublished, {});
  const [featured, ...rest] = (courses ?? []) as CourseCardItem[];

  return (
    <>
      {/* Courses: one featured, the rest stacked beside it */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className="text-[1.953rem] leading-tight font-bold text-ink sm:text-[2.441rem]">
              Courses that end in a working app
            </h2>
            <p className="mt-3 text-mist">
              Start a free course today, or try the preview lessons in any Pro course first.
            </p>
          </div>
          <Link href="/courses" className="btn btn-secondary">
            See all courses
          </Link>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {courses === undefined ? (
            <>
              <div className="h-96 animate-pulse rounded-xl bg-subtle motion-reduce:animate-none lg:col-span-2 lg:row-span-2 lg:h-auto" />
              <div className="h-72 animate-pulse rounded-xl bg-subtle motion-reduce:animate-none" />
              <div className="h-72 animate-pulse rounded-xl bg-subtle motion-reduce:animate-none" />
            </>
          ) : !featured ? (
            <p className="text-mist lg:col-span-3">New courses are on the way. Check back soon.</p>
          ) : (
            <>
              <div className="lg:col-span-2 lg:row-span-2">
                <CourseCard course={featured} />
              </div>
              {rest.slice(0, 2).map((course) => (
                <CourseCard key={course._id} course={course} />
              ))}
            </>
          )}
        </div>
      </section>

      {/* How a lesson works: a real sequence, so it is numbered */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="max-w-xl text-[1.953rem] leading-tight font-bold text-ink">
            How a lesson works
          </h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-2 border-line pt-6 first:border-sun">
                <span className="text-sm font-semibold text-mist tabular-nums">Step {i + 1}</span>
                <h3 className="mt-2 text-xl font-bold text-ink">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-mist">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* AI tutor (Pro) */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2">
        <div className="max-w-md">
          <span className="chip">
            <Crown className="h-3 w-3 text-sun" aria-hidden="true" />
            Pro
          </span>
          <h2 className="mt-4 text-[1.953rem] leading-tight font-bold text-ink sm:text-[2.441rem]">
            Stuck at 11pm? Ask the tutor.
          </h2>
          <p className="mt-4 leading-relaxed text-mist">
            The Vukora AI tutor knows which lesson you are on and what you have
            finished. Ask it to explain a line of code, or have it quiz you
            before you move on.
          </p>
          <Link href="/pricing" className="btn btn-primary mt-8">
            See Pro plans
          </Link>
        </div>

        <figure className="card space-y-4 p-5 sm:p-6">
          <figcaption className="sr-only">Example conversation with the Vukora AI tutor</figcaption>
          <p className="ml-auto w-fit max-w-[85%] rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-on-primary">
            Why does my query return undefined on the first render?
          </p>
          <div className="max-w-[90%] rounded-xl rounded-bl-sm bg-subtle px-4 py-3 text-sm leading-relaxed text-ink">
            <code className="font-mono text-[0.8125rem]">useQuery</code> returns{" "}
            <code className="font-mono text-[0.8125rem]">undefined</code> while
            it loads. In this lesson we render a skeleton for that case, then
            the list once the data arrives.
          </div>
          <div className="rounded-xl border border-line p-4">
            <p className="text-sm font-semibold text-ink">Quick check</p>
            <p className="mt-1 text-sm text-mist">What should you render while a query is loading?</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="rounded-md border border-line px-3 py-2 text-mist">Nothing, return null forever</li>
              <li className="flex items-center justify-between rounded-md border border-sage px-3 py-2 text-ink">
                A loading state
                <Check className="h-4 w-4 text-sage" aria-label="Correct" />
              </li>
            </ul>
          </div>
        </figure>
      </section>

      {/* Instructor */}
      <section className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-20 sm:px-6 md:grid-cols-[auto_1fr] md:gap-12">
          <span
            aria-hidden="true"
            className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-3xl font-extrabold text-on-primary"
          >
            {TUTOR.name[0]}
          </span>
          <div className="max-w-2xl">
            <h2 className="text-[1.563rem] font-bold text-ink">Taught by {TUTOR.name}</h2>
            <p className="mt-1 text-sm text-mist">
              {TUTOR.role}, @{TUTOR.handle}
            </p>
            <p className="mt-5 text-lg leading-relaxed text-ink">{TUTOR.bio}</p>
            <a
              href={TUTOR.url}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              frontendted.co.za
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      {/* Free vs Pro */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid overflow-hidden rounded-xl border border-line md:grid-cols-2">
          {[
            { name: "Free", price: "$0", items: FREE },
            { name: "Pro", price: "From $24/month", items: PRO },
          ].map((plan) => (
            <div key={plan.name} className="bg-surface p-6 sm:p-8 md:even:border-l md:even:border-line max-md:even:border-t max-md:even:border-line">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl font-bold text-ink">{plan.name}</h3>
                <span className="text-sm text-mist">{plan.price}</span>
              </div>
              <ul className="mt-5 space-y-2.5 text-sm text-ink">
                {plan.items.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <Link href="/pricing" className="mt-5 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline">
          Compare plans
        </Link>
      </section>

      {/* Closing band */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="night relative mx-auto max-w-6xl overflow-hidden rounded-3xl px-6 pt-16 pb-28 sm:px-12">
          <div
            aria-hidden="true"
            className="absolute -bottom-40 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sun shadow-[0_0_120px_30px_var(--sun)]"
          />
          <div className="relative max-w-xl">
            <h2 className="text-[1.953rem] leading-tight font-bold text-ink sm:text-[2.441rem]">
              Wake up to what you can build.
            </h2>
            <p className="mt-4 text-mist">Start with a free course. Upgrade when you want the full library.</p>
            <div className="mt-8">
              <StartLearning className="btn btn-sun btn-lg" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
