"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Script from "next/script";
import { Cookie } from "lucide-react";
import { type Consent, getServerSnapshot, getSnapshot, openConsentSettings, setConsent, subscribe } from "@/lib/consent";

// Google Tag Manager container. Production only, so local work never sends test traffic.
const GTM_ID = process.env.NODE_ENV === "production" ? "GTM-N73G9KCG" : null;

/** The consent banner, and Google Tag Manager once (and only once) the visitor accepts. */
export function CookieConsent() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const granted = state.startsWith("granted");
  const open = state.endsWith(":open");
  const reopened = open && !state.startsWith("unset");

  // Leave the way it arrived: fade and drop for 150ms, then save the choice.
  const [closing, setClosing] = useState(false);
  const choose = (value: Consent) => {
    setClosing(true);
    window.setTimeout(() => {
      setConsent(value);
      setClosing(false);
    }, 150);
  };

  const firstAction = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Opened from "Cookie settings": take keyboard users straight to the choice.
    if (reopened) firstAction.current?.focus();
  }, [reopened]);

  return (
    <>
      {granted && GTM_ID && (
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}

      {open && (
        <section
          aria-labelledby="cookie-consent-title"
          inert={closing}
          className={`card fixed inset-x-4 bottom-4 z-50 p-5 transition-[opacity,translate] ease-(--ease-out) starting:translate-y-2 starting:opacity-0 motion-reduce:starting:translate-y-0 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md sm:p-6 ${
            closing ? "translate-y-2 opacity-0 duration-150 motion-reduce:translate-y-0" : "duration-200"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-subtle" aria-hidden="true">
              <Cookie className="h-4 w-4 text-ink" />
            </span>
            <div className="min-w-0">
              <h2 id="cookie-consent-title" className="font-semibold tracking-[-0.01em] text-ink">
                Cookies on Interflect
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-mist text-pretty">
                We’d like to use analytics to see which lessons help and where people get stuck. Those cookies
                only load if you accept. Sign-in cookies stay on, because the site needs them to work.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              ref={firstAction}
              type="button"
              onClick={() => choose("denied")}
              className="btn btn-secondary"
            >
              Decline
            </button>
            <button type="button" onClick={() => choose("granted")} className="btn btn-primary">
              Accept analytics
            </button>
          </div>
        </section>
      )}
    </>
  );
}

/** A quiet text button that reopens the banner, for the footer and the app sidebar. */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={openConsentSettings}
      className={`text-left underline-offset-4 hover:text-ink hover:underline ${className}`}
    >
      Cookie settings
    </button>
  );
}
