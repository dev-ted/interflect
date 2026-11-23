import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PRO_ENABLED } from "@/convex/lib/features";
import { PricingClient } from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start free, or go Pro monthly or yearly (two months free) for every course and the Interflect tutor.",
};

export default function PricingPage() {
  // Everything is free while Pro is switched off.
  if (!PRO_ENABLED) redirect("/courses");
  return (
    <main className="flex-1">
      <PricingClient />
    </main>
  );
}
