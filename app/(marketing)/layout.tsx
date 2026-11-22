import { Footer } from "@/components/Footer";
import { MarketingNav } from "@/components/marketing/MarketingNav";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <MarketingNav />
      {children}
      <Footer />
    </>
  );
}
