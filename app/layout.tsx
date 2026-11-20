import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { PageContextProvider } from "@/components/PageContextProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LearnlyWidget } from "@/components/learnly/LearnlyWidget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <ConvexClientProvider>
            <PageContextProvider>
              <Suspense
                fallback={
                  <header className="h-16 border-b border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-950" />
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
