import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/consent/CookieConsent";
import { Email, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "The cookies and browser storage Interflect uses, why, and how to change your choice.",
};

export default function CookiesPage() {
  return (
    <LegalPage
      current="/cookies"
      title="Cookie policy"
      intro="Cookies are small files a website stores in your browser. We keep them to a minimum: the ones the site needs to work are always on, and analytics only load if you accept them."
    >
      <h2 id="choice">1. Your choice</h2>
      <p>
        When you first visit, we ask whether you accept analytics cookies. Nothing that tracks you loads until you say
        yes. You can change your mind at any time, and if you withdraw consent we remove the analytics cookies and stop
        loading the tags.
      </p>
      <p>
        <CookieSettingsButton className="btn btn-secondary no-underline" />
      </p>

      <h2 id="essential">2. Essential cookies and storage</h2>
      <p>These are needed for the site to work, so they cannot be turned off here.</p>
      <table>
        <thead>
          <tr><th scope="col">Name</th><th scope="col">Set by</th><th scope="col">Purpose</th><th scope="col">Lasts</th></tr>
        </thead>
        <tbody>
          <tr><td><code>__session</code>, <code>__client_uat</code>, <code>__clerk_*</code></td><td>Clerk</td><td>Keep you signed in and protect your account</td><td>Session to 1 year</td></tr>
          <tr><td><code>__cf_bm</code></td><td>Clerk (via Cloudflare)</td><td>Bot protection on sign-in</td><td>30 minutes</td></tr>
          <tr><td><code>interflect:consent</code> (local storage)</td><td>Interflect</td><td>Remember your cookie choice</td><td>Until cleared</td></tr>
          <tr><td><code>vukora-color-scheme</code>, <code>interflect-sidebar</code> (local storage)</td><td>Interflect</td><td>Remember light or dark mode and sidebar state</td><td>Until cleared</td></tr>
        </tbody>
      </table>

      <h2 id="performance">3. Video playback measurement</h2>
      <p>
        Our video player (Mux) records anonymous playback quality, such as startup time, buffering and errors, so we
        can fix video problems. It uses a random viewer ID in your browser’s storage and does not track you across
        other sites.
      </p>

      <h2 id="analytics">4. Analytics cookies (only with consent)</h2>
      <table>
        <thead>
          <tr><th scope="col">Name</th><th scope="col">Set by</th><th scope="col">Purpose</th><th scope="col">Lasts</th></tr>
        </thead>
        <tbody>
          <tr><td><code>_ga</code>, <code>_ga_*</code></td><td>Google Analytics, through Google Tag Manager</td><td>Count visits and see which pages and lessons are used</td><td>Up to 2 years</td></tr>
          <tr><td><code>_gid</code>, <code>_gat</code></td><td>Google Analytics</td><td>Tell visits apart and limit request rates</td><td>1 minute to 24 hours</td></tr>
        </tbody>
      </table>
      <p>
        Google may process this data outside South Africa. See{" "}
        <a href="https://policies.google.com/technologies/partner-sites" rel="noopener" target="_blank">
          how Google uses data from sites that use its services
        </a>
        .
      </p>

      <h2 id="browser">5. Controlling cookies in your browser</h2>
      <p>
        You can also block or delete cookies in your browser settings. If you block essential cookies, you will not be
        able to sign in.
      </p>

      <h2 id="more">6. More information</h2>
      <p>
        For how we handle personal information more broadly, see our <Link href="/privacy">privacy policy</Link>.
        Questions: <Email />.
      </p>
    </LegalPage>
  );
}
