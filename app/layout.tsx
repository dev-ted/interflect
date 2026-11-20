import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import {
  Bricolage_Grotesque,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { Suspense } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { PageContextProvider } from "@/components/PageContextProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LearnlyWidget } from "@/components/learnly/LearnlyWidget";
import "./globals.css";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Learnly Studio | Full-Stack & AI Engineering LMS",
  description:
    "Hands-on engineering courses by Sonny Sangha featuring Mux HD video lessons, rich markdown guides, interactive quizzes, Clerk Billing Pro tier, and the Learnly AI tutor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bricolageGrotesque.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col selection:bg-[#FFB800] selection:text-[#111116]">
        <ClerkProvider>
          <ConvexClientProvider>
            <PageContextProvider>
              <Suspense
                fallback={
                  <header className="h-16 border-b-2 border-[#18181B] bg-[#FFFBF2] dark:border-[#323244] dark:bg-[#0D0D12]" />
                }
              >
                <Navbar />
              </Suspense>
              {children}
              <Footer />
              <Suspense fallback={null}>
                <LearnlyWidget />
              </Suspense>
            </PageContextProvider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
