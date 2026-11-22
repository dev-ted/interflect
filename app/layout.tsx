import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { Suspense } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { PageContextProvider } from "@/components/PageContextProvider";
import { AppPreferences } from "@/components/brand/AppPreferences";
import { VukoraWidget } from "@/components/vukora/VukoraWidget";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "Vukora: learn to build real software", template: "%s | Vukora" },
  description:
    "Project-based courses in full-stack web and AI engineering. Watch the lesson, read the notes, check what you learned, and get unstuck with the Vukora tutor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${schibsted.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AppPreferences>
          <ClerkProvider>
            <ConvexClientProvider>
              <PageContextProvider>
                {children}
                <Suspense fallback={null}>
                  <VukoraWidget />
                </Suspense>
              </PageContextProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </AppPreferences>
      </body>
    </html>
  );
}
