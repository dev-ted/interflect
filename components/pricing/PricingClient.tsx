"use client";

import { useState } from "react";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { toast } from "@ui-sdk/react/toast";
import { Check, Crown } from "lucide-react";
import { useRefreshConvexAuth } from "@/components/ConvexClientProvider";
import { PRO_PLAN_ID, PRO_PLAN_SLUG } from "@/lib/auth";

type BillingPeriod = "month" | "annual";

const FREE_FEATURES = [
  "Every free course",
  "Preview lessons inside every Pro course",
  "Written notes with highlighted code",
  "Lesson quizzes with explanations",
  "Enrollment and progress tracking",
];

const PRO_FEATURES = [
  "Everything in Free",
  "Every Pro course, including future ones",
  "The full HD video library",
  "The Vukora AI tutor on every lesson",
  "Quizzes generated from your progress",
  "Course recommendations",
];

const FAQS = [
  {
    q: "How does yearly billing work?",
    a: "Monthly Pro is $29 a month, or $348 a year. Yearly is $290, about $24.17 a month, which saves you $58: two months free.",
  },
  {
    q: "Can I try a Pro course before upgrading?",
    a: "Yes. Every Pro course has free preview lessons, so you can watch the video, read the notes and take the quiz first.",
  },
  {
    q: "How does the Vukora AI tutor work?",
    a: "On Pro, open the Vukora button in the bottom-right corner of any page. It knows which lesson you are viewing and which courses you have finished, and it can quiz you.",
  },
  {
    q: "Can I cancel or switch plans?",
    a: "Yes, at any time. Manage your subscription, invoices and payment methods from your account menu.",
  },
];

const segmentItem =
  "relative z-10 inline-flex h-9 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-semibold text-mist transition-colors duration-150 data-checked:text-ink";

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 flex-1 space-y-3 text-sm text-ink">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function PricingClient() {
  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const refreshConvexAuth = useRefreshConvexAuth();
  const annual = period === "annual";

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-xl">
          <h1 className="text-[2.441rem] leading-tight font-extrabold text-ink sm:text-[3.052rem]">
            Start free. Go Pro when you are ready.
          </h1>
          <p className="mt-4 text-lg text-mist">
            Free gets you real courses today. Pro opens the whole library and
            the AI tutor.
          </p>
        </div>

        <SegmentedControl
          aria-label="Billing period"
          value={period}
          onValueChange={(val) => {
            if (val === "month" || val === "annual") setPeriod(val);
          }}
          className="relative inline-flex items-center rounded-lg border border-line bg-subtle p-1"
        >
          <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-md bg-surface shadow-card transition-[left,width] duration-200 ease-(--ease-out) data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
          <SegmentedControlItem value="month" className={segmentItem}>
            Monthly
          </SegmentedControlItem>
          <SegmentedControlItem value="annual" className={segmentItem}>
            Yearly
            <span className="text-xs font-medium text-sage">2 months free</span>
          </SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <section aria-labelledby="plan-free" className="card flex flex-col p-6 sm:p-8">
          <h2 id="plan-free" className="text-xl font-bold text-ink">Free</h2>
          <p className="mt-2 text-sm text-mist">
            Take the free courses and sample any Pro course.
          </p>
          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="text-[3.052rem] leading-none font-extrabold text-ink">$0</span>
            <span className="text-sm text-mist">forever</span>
          </p>
          <FeatureList items={FREE_FEATURES} />
          <Link href="/courses" className="btn btn-secondary btn-lg mt-8 w-full">
            Browse free courses
          </Link>
        </section>

        <section aria-labelledby="plan-pro" className="night flex flex-col rounded-xl border border-line p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 id="plan-pro" className="text-xl font-bold text-ink">Pro</h2>
            <Crown className="h-5 w-5 text-sun" aria-hidden="true" />
          </div>
          <p className="mt-2 text-sm text-mist">
            Every Pro course, the HD video library and the AI tutor.
          </p>
          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="text-[3.052rem] leading-none font-extrabold text-ink tabular-nums">
              {annual ? "$24.17" : "$29"}
            </span>
            <span className="text-sm text-mist">a month</span>
          </p>
          <p className="mt-2 text-sm text-mist">
            {annual ? "Billed $290 a year, saving $58." : "Billed monthly. Switch to yearly for two months free."}
          </p>
          <FeatureList items={PRO_FEATURES} />

          <div className="mt-8">
            <Show
              when={(has) =>
                has({ plan: PRO_PLAN_SLUG }) || has({ feature: "pro_courses" })
              }
              fallback={
                <>
                  <Authenticated>
                    <CheckoutButton
                      planId={PRO_PLAN_ID}
                      planPeriod={period}
                      for="user"
                      newSubscriptionRedirectUrl="/dashboard"
                      onSubscriptionComplete={() => {
                        void refreshConvexAuth();
                        toast.success(
                          "Welcome to Pro. Every course and the AI tutor are unlocked.",
                        );
                      }}
                    >
                      <button type="button" className="btn btn-sun btn-lg w-full">
                        {annual ? "Upgrade for $290 a year" : "Upgrade for $29 a month"}
                      </button>
                    </CheckoutButton>
                  </Authenticated>
                  <Unauthenticated>
                    <SignUpButton mode="modal">
                      <button type="button" className="btn btn-sun btn-lg w-full">
                        Sign up to go Pro
                      </button>
                    </SignUpButton>
                  </Unauthenticated>
                </>
              }
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-sage">
                <Check className="h-4 w-4" aria-hidden="true" />
                You are on Pro
              </p>
              <Link href="/dashboard" className="btn btn-secondary btn-lg mt-4 w-full">
                Go to my learning
              </Link>
            </Show>
          </div>
        </section>
      </div>

      <section aria-labelledby="faq" className="mt-24 grid gap-10 border-t border-line pt-16 lg:grid-cols-[1fr_2fr]">
        <h2 id="faq" className="text-[1.953rem] leading-tight font-bold text-ink">
          Questions
        </h2>
        <dl className="divide-y divide-line">
          {FAQS.map((item) => (
            <div key={item.q} className="py-5 first:pt-0">
              <dt className="font-semibold text-ink">{item.q}</dt>
              <dd className="mt-2 leading-relaxed text-mist">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
