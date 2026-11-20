import { HeroShowcase } from "@/components/landing/HeroShowcase";
import { LandingSections } from "@/components/landing/LandingSections";

export default function HomePage() {
  return (
    <main className="flex-1 bg-background text-foreground">
      <HeroShowcase />
      <LandingSections />
    </main>
  );
}
