import type { Metadata } from "next";
import { PricingClient } from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing | Vukora",
  description:
    "Start free, or go Pro monthly or yearly (two months free) for every course and the Vukora AI tutor.",
};

export default function PricingPage() {
  return (
    <main className="flex-1">
      <PricingClient />
    </main>
  );
}
