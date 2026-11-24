import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { PageContextProvider } from "@/components/PageContextProvider";
import { AppPreferences } from "@/components/brand/AppPreferences";
import { VukoraWidget } from "@/components/vukora/VukoraWidget";
import { CookieConsent } from "@/components/consent/CookieConsent";
import { TUTOR_ENABLED } from "@/convex/lib/features";
import "./globals.css";

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: { default: "Interflect: think better, design better", template: "%s | Interflect" },
  description:
    "Learn the principles behind interfaces that work, then build them properly. Courses in UI design, UX, accessibility, design systems and frontend craft.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrument.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <AppPreferences>
          <ClerkProvider
            appearance={{
              // CSS variables keep Clerk's modals and menus in step with the day/night theme.
              variables: {
                colorPrimary: "var(--primary)",
                colorBackground: "var(--surface)",
                colorForeground: "var(--ink)",
                colorMutedForeground: "var(--mist)",
                colorInput: "var(--surface)",
                colorInputForeground: "var(--ink)",
                colorDanger: "var(--danger)",
                colorSuccess: "var(--sage)",
                fontFamily: "var(--font-instrument), system-ui, sans-serif",
                borderRadius: "0.625rem",
              },
            }}
          >
            <ConvexClientProvider>
              <PageContextProvider>
                {children}
                <CookieConsent />
                {TUTOR_ENABLED && (
                  <Suspense fallback={null}>
                    <VukoraWidget />
                  </Suspense>
                )}
              </PageContextProvider>
            </ConvexClientProvider>
          </ClerkProvider>
        </AppPreferences>
      </body>
    </html>
  );
}
