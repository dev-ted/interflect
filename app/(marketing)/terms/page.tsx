import type { Metadata } from "next";
import Link from "next/link";
import { Email, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The agreement between you and Interflect when you use the site and its courses.",
};

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms of service"
      intro="These terms are the agreement between you and Interflect when you use Interflect, its courses and anything else we offer on the site. Please read them. By creating an account or using the site, you agree to them."
    >
      <h2 id="who">1. Who we are</h2>
      <p>
        Interflect (“we”, “us”) is an online learning platform for UI design, UX and frontend development, run
        from South Africa. You can reach us at <Email />.
      </p>

      <h2 id="account">2. Your account</h2>
      <ul>
        <li>You need an account to enrol in courses and track progress. Give us accurate details and keep them current.</li>
        <li>You must be at least 13. If you are under 18, a parent or guardian must agree to these terms for you.</li>
        <li>Keep your sign-in secure. You are responsible for what happens under your account. Tell us straight away if you think someone else has used it.</li>
        <li>One account per person. Accounts are personal and may not be shared, sold or transferred.</li>
      </ul>

      <h2 id="licence">3. Using the courses</h2>
      <p>
        When you have access to a course, we give you a personal, non-exclusive, non-transferable licence to watch,
        read and work through it for your own learning. You may:
      </p>
      <ul>
        <li>use what you learn, and code you write while following a lesson, in your own personal or commercial projects;</li>
        <li>keep notes for your own use.</li>
      </ul>
      <p>You may not:</p>
      <ul>
        <li>download, record, copy, resell, republish or share lesson videos, notes, quizzes or other course material;</li>
        <li>use the material to build a competing course or train an AI model;</li>
        <li>scrape the site, get around access controls, or interfere with how the site works;</li>
        <li>use the site for anything unlawful, harmful or abusive.</li>
      </ul>

      <h2 id="content">4. Content you submit</h2>
      <p>
        You keep ownership of anything you submit, such as quiz answers. You give us
        permission to store and process it to run the service, for example to save your progress. Do not submit anything you do not have the right to share, or anything unlawful or offensive.
      </p>

      <h2 id="ip">5. Our content</h2>
      <p>
        The site, the courses and everything in them, including videos, text, code samples, designs, the Interflect
        name and logo, belong to us or our licensors and are protected by copyright and trade mark law. Apart from the
        licence in section 3, these terms give you no rights in them.
      </p>

      <h2 id="changes">6. Changes to the service</h2>
      <p>
        Interflect is currently free. We keep improving it, so courses and features may change, and some may be
        retired. If we ever introduce paid plans, we will update these terms and tell you before anything is charged.
      </p>

      <h2 id="ending">7. Suspending or closing accounts</h2>
      <p>
        You can stop using Interflect and delete your account at any time. We may suspend or close an account that
        breaks these terms, puts others at risk or is used for fraud. Where it is reasonable, we will warn you first and
        give you a chance to put things right.
      </p>

      <h2 id="disclaimer">8. Disclaimers</h2>
      <p>
        Courses are for education. We work hard to keep them accurate and current, but we do not promise that the site
        will always be available or error-free, or that a course will lead to a particular job or result. To the
        extent the law allows, the service is provided “as is”.
      </p>

      <h2 id="liability">9. Limits on our liability</h2>
      <p>
        To the extent the law allows, we are not liable for indirect or consequential loss, such as lost profits,
        data or opportunities. Because the service is free, our total liability to you for any claim is limited to R500. Nothing here limits liability that cannot
        be limited by law, including for gross negligence, fraud, or your rights as a consumer.
      </p>

      <h2 id="privacy">10. Privacy</h2>
      <p>
        How we handle your personal information is explained in our <Link href="/privacy">privacy policy</Link> and{" "}
        <Link href="/cookies">cookie policy</Link>.
      </p>

      <h2 id="updates">11. Changes to these terms</h2>
      <p>
        We may update these terms. If a change matters, we will tell you by email or on the site before it takes
        effect. If you keep using Interflect after that, the new terms apply. If you do not agree, you can stop using
        the service and delete your account.
      </p>

      <h2 id="law">12. Governing law and disputes</h2>
      <p>
        These terms are governed by the laws of the Republic of South Africa. If something goes wrong, please contact
        us first so we can try to fix it. If we cannot, the South African courts have jurisdiction, and you keep any
        right to approach a consumer body or ombud.
      </p>

      <h2 id="contact">13. Contact</h2>
      <p>
        Questions about these terms: <Email />.
      </p>
    </LegalPage>
  );
}
