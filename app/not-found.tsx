import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Footer } from "@/components/Footer";
import { MarketingNav } from "@/components/marketing/MarketingNav";
import { StatusPage } from "@/components/status/StatusPage";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <MarketingNav />
      <StatusPage
        code="404"
        icon={<Compass className="h-5 w-5 text-mist" aria-hidden="true" />}
        title="We couldn’t find that page"
        actions={
          <>
            <Link href="/courses" className="btn btn-primary">
              Browse courses
            </Link>
            <Link href="/" className="btn btn-secondary">
              Home
            </Link>
          </>
        }
      >
        <p>The link may be old, or the page may have moved. Your courses and progress are still here.</p>
      </StatusPage>
      <Footer />
    </>
  );
}
