import type { Metadata } from "next";
import { PricingClient } from "@/components/pricing/PricingClient";

export const metadata: Metadata = {
  title: "Pricing | Learnly Studio",
  description:
    "Choose Monthly or Yearly Pro (2 months free) to unlock all courses and the Learnly AI tutor.",
};

export default function PricingPage() {
  return (
    <main className="flex-1">
      <PricingClient />
    </main>
  );
}
