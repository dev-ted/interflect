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
  "Vukora AI Tutor widget (context-aware on every lesson)",
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
    q: "How does Vukora AI Tutor work?",
    a: "Once you upgrade to Pro, click the Vukora button in the bottom-right corner on any page. It authenticates securely via Clerk, knows which lesson you're viewing and which courses you've finished, and can quiz you interactively.",
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
    <div className="bg-studio-dots">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex -rotate-1 items-center gap-1.5 rounded-full border-2 border-[#18181B] bg-[#FFB800] px-3.5 py-1 text-xs font-extrabold text-[#111116] shadow-[3px_3px_0_0_#111116]">
            <Crown className="h-3.5 w-3.5" aria-hidden="true" />
            Simple, Transparent Pricing
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#111116] sm:text-5xl dark:text-[#FAFAF5]">
            Invest in shipping real apps
          </h1>
          <p className="mt-3 text-base text-[#52525B] dark:text-[#B4B4C6]">
            Start free forever, or upgrade to Pro for the complete curriculum and
            your personal context-aware Vukora AI tutor.
          </p>

          {/* Billing Period Toggle */}
          <div className="mt-8 flex flex-col items-center gap-2">
            <SegmentedControl
              aria-label="Billing period"
              value={period}
              onValueChange={(val) => {
                if (val === "month" || val === "annual") setPeriod(val);
              }}
              className="relative isolate inline-flex rounded-2xl border-2 border-[#18181B] bg-[#F6EFE0] p-1.5 shadow-[4px_4px_0_0_#111116] dark:border-[#3A3A52] dark:bg-[#16161F] dark:shadow-[4px_4px_0_0_#000000]"
            >
              <SegmentedControlIndicator className="absolute top-(--segmented-control-indicator-top) left-(--segmented-control-indicator-left) -z-10 h-(--segmented-control-indicator-height) w-(--segmented-control-indicator-width) rounded-xl border-2 border-[#18181B] bg-white transition-[top,left,width,height] duration-200 data-[activation-direction=none]:transition-none dark:border-[#18181B] dark:bg-[#FFB800]" />
              <SegmentedControlItem
                value="month"
                className="min-h-10 cursor-pointer rounded-xl px-5 py-2 text-sm font-extrabold text-[#52525B] data-checked:text-[#111116] dark:text-[#B4B4C6] dark:data-checked:text-[#111116]"
              >
                Monthly
              </SegmentedControlItem>
              <SegmentedControlItem
                value="annual"
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl px-5 py-2 text-sm font-extrabold text-[#52525B] data-checked:text-[#111116] dark:text-[#B4B4C6] dark:data-checked:text-[#111116]"
              >
                Yearly
                <span className="rounded-full border border-[#18181B] bg-[#00B87C] px-2 py-0.5 text-[11px] font-extrabold text-[#111116]">
                  2 Months Free
                </span>
              </SegmentedControlItem>
            </SegmentedControl>
          </div>
        </div>

        {/* Custom Plan Cards */}
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-7 md:grid-cols-2">
          {/* Free Tier */}
          <div className="tactile-card-lg flex flex-col rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                Free
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border-2 border-[#18181B] bg-[#00B87C] px-3 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#111116]">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                Starter
              </span>
            </div>

            <p className="mt-2.5 text-sm text-[#52525B] dark:text-[#B4B4C6]">
              Explore free courses and sample free preview lessons across Pro
              tracks.
            </p>

            <div className="mt-6 flex items-baseline gap-1.5">
              <span className="font-display text-5xl font-extrabold tracking-tight text-[#111116] dark:text-[#FAFAF5]">
                $0
              </span>
              <span className="text-sm font-bold text-[#52525B] dark:text-[#B4B4C6]">
                / forever
              </span>
            </div>

            <ul className="mt-8 flex-1 space-y-3 text-sm font-medium text-[#111116] dark:text-[#E4E4EE]">
              {FREE_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#18181B] bg-[#00B87C] text-[#111116]">
                    <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Link
                href="/courses"
                className="tactile-btn flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FFFBF2] px-5 py-3 text-sm font-extrabold text-[#111116] hover:bg-[#FFB800] dark:bg-[#1F1F2D] dark:text-[#FAFAF5] dark:hover:bg-[#FFB800] dark:hover:text-[#111116]"
              >
                Browse Free Courses
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Pro Tier */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-[#18181B] bg-[#14141D] p-8 text-[#FAFAF5] shadow-[8px_8px_0_0_#2563EB] dark:border-[#3B82F6]">
            <svg
              aria-hidden="true"
              viewBox="0 0 120 120"
              className="pointer-events-none absolute -top-6 -right-6 h-28 w-28 text-[#FFB800]/15"
            >
              <path
                fill="currentColor"
                d="M60 6l12 36 36 12-36 12-12 36-12-36-36-12 36-12z"
              />
            </svg>

            <div className="relative flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#FAFAF5]">Pro</h2>
              <span className="inline-flex rotate-2 items-center gap-1 rounded-full border-2 border-[#111116] bg-[#FFB800] px-3 py-0.5 text-xs font-extrabold text-[#111116] shadow-[2px_2px_0_0_#000000]">
                <Crown className="h-3 w-3" aria-hidden="true" />
                Most Popular
              </span>
            </div>

            <p className="mt-2.5 text-sm text-[#D4D4E2]">
              Full access to every Pro course, Mux HD library, and Vukora AI
              Tutor.
            </p>

            <div className="mt-6">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-5xl font-extrabold tracking-tight text-[#FAFAF5]">
                  {period === "annual" ? "$24.17" : "$29"}
                </span>
                <span className="text-sm font-bold text-[#B4B4C6]">/ month</span>
              </div>
              {period === "annual" ? (
                <p className="mt-2 inline-flex rounded-full bg-[#00B87C]/20 px-2.5 py-0.5 text-xs font-bold text-[#7EE2B8]">
                  Billed $290/year · Save $58 (2 months free)
                </p>
              ) : (
                <p className="mt-2 text-xs font-medium text-[#B4B4C6]">
                  Billed monthly · Switch to Yearly for 2 months free
                </p>
              )}
            </div>

            <ul className="mt-8 flex-1 space-y-3 text-sm font-medium text-[#FAFAF5]">
              {PRO_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-[#111116] bg-[#FFB800] text-[#111116]">
                    <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
                  </span>
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
                            "Welcome to Pro! All courses and Vukora AI are unlocked.",
                          );
                        }}
                      >
                        <button
                          type="button"
                          className="tactile-btn flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-3 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
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
                          className="tactile-btn flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#FF5A36] px-5 py-3 text-sm font-extrabold text-[#111116] hover:bg-[#FF6E4E]"
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
                  <div className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#111116] bg-[#00B87C] px-5 py-3 text-sm font-extrabold text-[#111116]">
                    <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                    You&apos;re an Active Pro Member
                  </div>
                  <Link
                    href="/dashboard"
                    className="tactile-btn-sm flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-[#111116] hover:bg-[#FFB800]"
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
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="tactile-card flex items-start gap-3.5 rounded-2xl p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#18181B] bg-[#2563EB] text-white shadow-[2px_2px_0_0_#111116]">
              <Bot className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                Vukora AI Tutor Included
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                Powered by Vercel Eve and secured with Clerk auth. Ask questions
                about the exact lesson on your screen or generate interactive
                quizzes anytime.
              </p>
            </div>
          </div>

          <div className="tactile-card flex items-start gap-3.5 rounded-2xl p-5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-[#18181B] bg-[#00B87C] text-[#111116] shadow-[2px_2px_0_0_#111116]">
              <Video className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                Free Preview Before You Commit
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                Every Pro course includes unlocked preview lessons so you can
                verify video clarity, code depth, and quiz quality first.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <section className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#111116] sm:text-3xl dark:text-[#FAFAF5]">
            Frequently asked questions
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {FAQS.map((item) => (
              <div
                key={item.q}
                className="tactile-card rounded-2xl p-5"
              >
                <h3 className="text-sm font-extrabold text-[#111116] dark:text-[#FAFAF5]">
                  {item.q}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#52525B] dark:text-[#B4B4C6]">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
