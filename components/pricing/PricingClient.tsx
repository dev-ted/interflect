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
import {
  ArrowRight,
  Bot,
  Check,
  Crown,
  Sparkles,
  Video,
} from "lucide-react";
import { useRefreshConvexAuth } from "@/components/ConvexClientProvider";
import { PRO_PLAN_ID, PRO_PLAN_SLUG } from "@/lib/auth";

type BillingPeriod = "month" | "annual";

const FREE_FEATURES = [
  "Access to all Free courses",
  "Free preview lessons inside every Pro course",
  "Rich markdown guides & syntax-highlighted code blocks",
  "In-lesson interactive quizzes & explanations",
  "Course enrollment & lesson completion tracking",
];

const PRO_FEATURES = [
  "Everything in Free, plus unlimited Pro courses",
  "Full Mux HD video library across every track",
  "Learnly AI Tutor widget (context-aware on every lesson)",
  "AI-generated interactive quizzes tailored to your progress",
  "Personalized course recommendations across the catalog",
  "All future Pro courses & module updates included",
];

const FAQS = [
  {
    q: "How does the 2 months free yearly discount work?",
    a: "Monthly Pro is $29/month ($348/year). Switching to Yearly bills $290/year ($24.17/mo) — saving you $58, which is 2 full months free every year.",
  },
  {
    q: "Can I try a Pro course before upgrading?",
    a: "Yes! Pro courses include Free Preview lessons so you can watch the Mux video, read the markdown guide, and try the quiz before committing.",
  },
  {
    q: "How does Learnly AI Tutor work?",
    a: "Once you upgrade to Pro, click the Learnly button in the bottom-right corner on any page. It authenticates securely via Clerk, knows which lesson you're viewing and which courses you've finished, and can quiz you interactively.",
  },
  {
    q: "Can I cancel or switch plans anytime?",
    a: "Yes. Manage your subscription, invoices, and payment methods directly from your Clerk account menu at any time.",
  },
];

export function PricingClient() {
  const [period, setPeriod] = useState<BillingPeriod>("annual");
  const refreshConvexAuth = useRefreshConvexAuth();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-800/70 dark:bg-indigo-950/70 dark:text-indigo-300">
          <Crown className="h-3.5 w-3.5" aria-hidden="true" />
          Simple, Transparent Pricing
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-950 sm:text-5xl dark:text-white">
          Invest in shipping real apps
        </h1>
        <p className="mt-3 text-base text-zinc-600 dark:text-zinc-400">
          Start free forever, or upgrade to Pro for the complete curriculum and
          your personal context-aware Learnly AI tutor.
        </p>

        {/* Billing Period Toggle */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <SegmentedControl
            aria-label="Billing period"
            value={period}
            onValueChange={(val) => {
              if (val === "month" || val === "annual") setPeriod(val);
            }}
            className="relative isolate inline-flex rounded-xl border border-zinc-200 bg-zinc-100 p-1 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-lg bg-white shadow-xs transition-[top,left,width,height] duration-200 data-[activation-direction=none]:transition-none dark:bg-zinc-800" />
            <SegmentedControlItem
              value="month"
              className="cursor-pointer rounded-lg px-5 py-2 text-sm font-semibold text-zinc-600 data-checked:text-zinc-950 dark:text-zinc-400 dark:data-checked:text-white"
            >
              Monthly
            </SegmentedControlItem>
            <SegmentedControlItem
              value="annual"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-zinc-600 data-checked:text-zinc-950 dark:text-zinc-400 dark:data-checked:text-white"
            >
              Yearly
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                2 Months Free
              </span>
            </SegmentedControlItem>
          </SegmentedControl>
        </div>
      </div>

      {/* Custom Plan Cards */}
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Free Tier */}
        <div className="flex flex-col rounded-3xl border border-zinc-200/90 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              Free
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Starter
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Explore free courses and sample free preview lessons across Pro
            tracks.
          </p>

          <div className="mt-6 flex items-baseline gap-1">
            <span className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
              $0
            </span>
            <span className="text-sm text-zinc-500">/ forever</span>
          </div>

          <ul className="mt-8 flex-1 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            {FREE_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Link
              href="/courses"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Browse Free Courses
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Pro Tier */}
        <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-indigo-600 bg-white p-8 shadow-xl shadow-indigo-950/10 dark:border-indigo-500 dark:bg-zinc-900/90">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">
              Pro
            </h2>
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
              <Crown className="h-3 w-3" aria-hidden="true" />
              Most Popular
            </span>
          </div>

          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Full access to every Pro course, Mux HD library, and Learnly AI
            Tutor.
          </p>

          <div className="mt-6">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-white">
                {period === "annual" ? "$24.17" : "$29"}
              </span>
              <span className="text-sm text-zinc-500">/ month</span>
            </div>
            {period === "annual" ? (
              <p className="mt-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Billed $290/year · Save $58 (2 months free)
              </p>
            ) : (
              <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                Billed monthly · Switch to Yearly for 2 months free
              </p>
            )}
          </div>

          <ul className="mt-8 flex-1 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
            {PRO_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8">
            <Show
              when={(has) =>
                has({ plan: PRO_PLAN_SLUG }) ||
                has({ feature: "pro_courses" })
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
                          "Welcome to Pro! All courses and Learnly AI are unlocked.",
                        );
                      }}
                    >
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                      >
                        <Crown className="h-4 w-4" aria-hidden="true" />
                        {period === "annual"
                          ? "Upgrade to Pro Yearly ($290/yr)"
                          : "Upgrade to Pro Monthly ($29/mo)"}
                      </button>
                    </CheckoutButton>
                  </Authenticated>

                  <Unauthenticated>
                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500"
                      >
                        <Crown className="h-4 w-4" aria-hidden="true" />
                        Sign Up to Unlock Pro
                      </button>
                    </SignUpButton>
                  </Unauthenticated>
                </>
              }
            >
              <div className="space-y-2.5">
                <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  You&apos;re an Active Pro Member
                </div>
                <Link
                  href="/dashboard"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
                >
                  Go to My Learning Dashboard
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </Show>
          </div>
        </div>
      </div>

      {/* Pro Highlights Strip */}
      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Learnly AI Tutor Included
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Powered by Vercel Eve and secured with Clerk auth. Ask questions
              about the exact lesson on your screen or generate interactive
              quizzes anytime.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
            <Video className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
              Free Preview Before You Commit
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              Every Pro course includes unlocked preview lessons so you can
              verify video clarity, code depth, and quiz quality first.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-4xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-zinc-950 dark:text-white">
          Frequently asked questions
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FAQS.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-zinc-200/80 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <h3 className="text-sm font-semibold text-zinc-950 dark:text-white">
                {item.q}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
