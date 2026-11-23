"use client";

import { useState } from "react";
import Link from "next/link";
import { Show, SignUpButton } from "@clerk/nextjs";
import { CheckoutButton } from "@clerk/nextjs/experimental";
import { Authenticated, Unauthenticated } from "convex/react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@ui-sdk/react/accordion";
import {
  SegmentedControl,
  SegmentedControlIndicator,
  SegmentedControlItem,
} from "@ui-sdk/react/segmented-control";
import { toast } from "@ui-sdk/react/toast";
import { Check, ChevronDown, X } from "lucide-react";
import { useRefreshConvexAuth } from "@/components/ConvexClientProvider";
import { PRO_PLAN_ID, PRO_PLAN_SLUG } from "@/lib/auth";

type BillingPeriod = "month" | "annual";

const FREE_FEATURES: Array<[string, boolean]> = [
  ["Every free course", true],
  ["Preview lessons in every Pro course", true],
  ["Written notes and lesson quizzes", true],
  ["Progress tracking", true],
  ["Pro courses", false],
  ["The Interflect tutor", false],
];

const PRO_FEATURES = [
  "Every Pro course, including new ones",
  "The Interflect tutor on every lesson",
  "Quizzes made from what you are learning",
  "Interface reviews and explanations on demand",
];

const FAQS = [
  {
    q: "How does yearly billing work?",
    a: "Pro is R50 a month, or R500 a year. Paying yearly works out to about R41.67 a month, which is two months free.",
  },
  {
    q: "Can I try a Pro course first?",
    a: "Yes. Every Pro course has free preview lessons, so you can watch, read the notes and take the quiz before you upgrade.",
  },
  {
    q: "What does the Interflect tutor do?",
    a: "It knows the lesson you are on. Ask why a layout works, have it review a snippet, or ask for a quick quiz before you move on.",
  },
  {
    q: "Can I cancel any time?",
    a: "Yes. Manage your plan, invoices and payment method from your account menu. Pro stays active until the end of the period you paid for.",
  },
];

const segmentItem =
  "relative z-10 inline-flex h-8 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-medium text-mist transition-colors duration-150 data-checked:text-ink";

/** A price that crossfades when the billing period changes (user-triggered, so it may animate). */
function Price({ value }: { value: string }) {
  return (
    <span
      key={value}
      className="inline-block text-[3.5rem] leading-none font-semibold tracking-[-0.04em] tabular-nums transition-[opacity,translate,filter] duration-200 ease-(--ease-out) starting:translate-y-1 starting:opacity-0 starting:blur-[2px] motion-reduce:starting:translate-y-0"
    >
      {value}
    </span>
  );
}

export function PricingClient() {
  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const refreshConvexAuth = useRefreshConvexAuth();
  const annual = period === "annual";

  return (
    <div className="relative">
      <div
        className="bg-grid pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-50 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-24 sm:px-6 lg:pt-24">
        <header className="mx-auto max-w-xl text-center">
          <h1 className="text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.04em] text-ink sm:text-[3.5rem]">
            Start free. Go Pro when you’re ready.
          </h1>
          <p className="mt-5 text-lg text-mist">
            Free gets you real courses today. Pro opens the full library and the tutor.
          </p>
        </header>

        <div className="mt-10 flex justify-center">
          <SegmentedControl
            aria-label="Billing period"
            value={period}
            onValueChange={(val) => {
              if (val === "month" || val === "annual") setPeriod(val);
            }}
            className="relative inline-flex items-center rounded-full border border-line bg-subtle p-1"
          >
            <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-full bg-surface shadow-card transition-[left,width] duration-200 ease-(--ease-out) data-[activation-direction=none]:transition-none motion-reduce:transition-none" />
            <SegmentedControlItem value="month" className={segmentItem}>
              Monthly
            </SegmentedControlItem>
            <SegmentedControlItem value="annual" className={segmentItem}>
              Yearly
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent-ink">
                2 months free
              </span>
            </SegmentedControlItem>
          </SegmentedControl>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {/* Free */}
          <section aria-labelledby="plan-free" className="card flex flex-col p-7">
            <h2 id="plan-free" className="text-lg font-semibold text-ink">Free</h2>
            <p className="mt-5 flex items-baseline gap-2 text-ink">
              <Price value="R0" />
              <span className="text-mist">per month</span>
            </p>
            <p className="mt-2 text-sm text-mist">Free for as long as you like.</p>

            <Unauthenticated>
              <SignUpButton mode="modal">
                <button type="button" className="btn btn-secondary btn-lg mt-7 w-full">
                  Start for free
                </button>
              </SignUpButton>
            </Unauthenticated>
            <Authenticated>
              <Link href="/courses" className="btn btn-secondary btn-lg mt-7 w-full">
                Browse free courses
              </Link>
            </Authenticated>

            <hr className="my-7 border-line" />
            <p className="text-sm font-medium text-ink">Includes</p>
            <ul className="mt-4 space-y-3 text-sm">
              {FREE_FEATURES.map(([item, included]) => (
                <li key={item} className={`flex gap-3 ${included ? "text-ink" : "text-mist"}`}>
                  {included ? (
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>
                    {item}
                    {!included && <span className="sr-only"> (not included)</span>}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Pro */}
          <section
            aria-labelledby="plan-pro"
            className="night flex flex-col rounded-[calc(var(--radius)+4px)] border border-line p-7"
          >
            <h2 id="plan-pro" className="text-lg font-semibold text-ink">Pro</h2>
            <p className="mt-5 flex items-baseline gap-2 text-ink">
              <Price value={annual ? "R41.67" : "R50"} />
              <span className="text-mist">per month</span>
            </p>
            <p className="mt-2 text-sm text-mist">
              {annual ? "R500 billed yearly." : "Billed monthly."}
            </p>

            <div className="mt-7">
              <Show
                when={(has) => has({ plan: PRO_PLAN_SLUG }) || has({ feature: "pro_courses" })}
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
                          toast.success("Welcome to Pro. Every course and the tutor are unlocked.");
                        }}
                      >
                        <button type="button" className="btn btn-primary btn-lg w-full">
                          Upgrade to Pro
                        </button>
                      </CheckoutButton>
                    </Authenticated>
                    <Unauthenticated>
                      <SignUpButton mode="modal">
                        <button type="button" className="btn btn-primary btn-lg w-full">
                          Get Pro
                        </button>
                      </SignUpButton>
                    </Unauthenticated>
                  </>
                }
              >
                <Link href="/dashboard" className="btn btn-secondary btn-lg w-full">
                  You’re on Pro. Go to my learning
                </Link>
              </Show>
            </div>

            <hr className="my-7 border-line" />
            <p className="text-sm font-medium text-ink">Everything in Free, plus</p>
            <ul className="mt-4 space-y-3 text-sm text-ink">
              {PRO_FEATURES.map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className="mt-6 text-center text-sm text-mist">
          Prices in rands. Cancel any time from your account.
        </p>

        <section aria-labelledby="faq" className="mx-auto mt-24 max-w-2xl">
          <h2 id="faq" className="text-2xl font-semibold tracking-[-0.03em] text-ink">
            Questions
          </h2>
          <Accordion className="mt-6 border-t border-line">
            {FAQS.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-b border-line">
                <AccordionHeader>
                  <AccordionTrigger className="group flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left font-medium text-ink">
                    {item.q}
                    <ChevronDown
                      className="h-4 w-4 shrink-0 text-mist transition-transform duration-200 ease-(--ease-out) group-data-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </AccordionTrigger>
                </AccordionHeader>
                <AccordionPanel className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-200 ease-(--ease-out) data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none">
                  <p className="pb-5 leading-relaxed text-mist">{item.a}</p>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>
    </div>
  );
}
