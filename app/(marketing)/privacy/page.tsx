import type { Metadata } from "next";
import Link from "next/link";
import { Email, LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "What personal information Interflect collects, why, who it is shared with and the rights you have.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy policy"
      intro="This policy explains what personal information we collect when you use Interflect, why we need it, who we share it with and the choices you have. We follow South Africa’s Protection of Personal Information Act (POPIA), and we give the same rights to learners everywhere, including under the GDPR."
    >
      <h2 id="responsible">1. Who is responsible</h2>
      <p>
        Interflect is the responsible party for your personal information. Our Information Officer handles privacy
        questions and requests at <Email />.
      </p>

      <h2 id="collect">2. What we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li><strong>Account details:</strong> your name, email address, profile picture and sign-in method, when you sign up with email or a social account.</li>
        <li><strong>Learning activity:</strong> courses you enrol in or track, lessons you complete, quiz answers and scores, weekly goals and dashboard preferences.</li>
        <li><strong>Messages:</strong> anything you send us by email.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li><strong>Technical data:</strong> IP address, browser, device and pages requested, recorded in server logs to keep the site secure and working.</li>
        <li><strong>Video playback data:</strong> playback quality, buffering and errors, so we can fix video problems.</li>
        <li><strong>Analytics:</strong> how pages and lessons are used, only if you accept analytics cookies. See our <Link href="/cookies">cookie policy</Link>.</li>
      </ul>
      <p>We do not collect special personal information, such as health or religious data, and we do not sell personal information.</p>

      <h2 id="why">3. Why we use it</h2>
      <table>
        <thead>
          <tr><th scope="col">Purpose</th><th scope="col">Lawful basis</th></tr>
        </thead>
        <tbody>
          <tr><td>Create your account, sign you in, and give you access to courses</td><td>Performing our agreement with you</td></tr>
          <tr><td>Save your progress, quizzes and dashboard</td><td>Performing our agreement with you</td></tr>
          <tr><td>Keep the site secure, prevent abuse and fix problems</td><td>Our legitimate interests</td></tr>
          <tr><td>Understand which lessons help and improve courses</td><td>Your consent (analytics cookies); legitimate interests (aggregate playback data)</td></tr>
          <tr><td>Send service messages, such as changes to these terms</td><td>Performing our agreement; legal obligations</td></tr>
          <tr><td>Send marketing emails</td><td>Your consent, which you can withdraw in any email</td></tr>
        </tbody>
      </table>

      <h2 id="share">4. Who we share it with</h2>
      <p>
        We use trusted service providers (operators) to run Interflect. They process personal information only on our
        instructions and under contracts that require them to keep it secure.
      </p>
      <table>
        <thead>
          <tr><th scope="col">Provider</th><th scope="col">What they do</th></tr>
        </thead>
        <tbody>
          <tr><td>Clerk</td><td>Sign-in and accounts</td></tr>
          <tr><td>Convex</td><td>Database for your learning activity</td></tr>
          <tr><td>Vercel</td><td>Website hosting</td></tr>
          <tr><td>Mux</td><td>Video streaming and playback quality monitoring</td></tr>
          <tr><td>Google (Tag Manager and Analytics)</td><td>Site analytics, only with your consent</td></tr>
        </tbody>
      </table>
      <p>
        We may also disclose information if the law requires it, to protect people’s safety or our rights, or as part
        of a sale or restructuring of the business, in which case this policy will continue to apply.
      </p>

      <h2 id="transfers">5. International transfers</h2>
      <p>
        Most of our providers store data outside South Africa, mainly in the United States and the European Union. We
        only use providers that are bound by data protection laws or contractual safeguards that give your information
        a level of protection substantially similar to POPIA, as section 72 requires.
      </p>

      <h2 id="retention">6. How long we keep it</h2>
      <ul>
        <li>Account and learning data: while your account is open. When you delete your account, we delete or anonymise it within 30 days.</li>
        <li>Server logs: up to 90 days.</li>
        <li>Analytics data: up to 14 months.</li>
      </ul>

      <h2 id="security">7. How we protect it</h2>
      <p>
        Data is encrypted in transit and at rest with our providers, access is limited to people who need it, and
        sign-in is handled by a dedicated authentication provider. No system is perfectly secure; if a breach affects
        your information, we will notify you and the Information Regulator as POPIA requires.
      </p>

      <h2 id="rights">8. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>ask whether we hold information about you and get a copy of it;</li>
        <li>have inaccurate information corrected;</li>
        <li>have your information deleted, or your account closed;</li>
        <li>object to processing based on our legitimate interests, and to direct marketing at any time;</li>
        <li>withdraw consent, for example by changing your cookie settings, without affecting earlier processing;</li>
        <li>receive your data in a portable format;</li>
        <li>complain to a regulator.</li>
      </ul>
      <p>
        To use any of these rights, email <Email />. We may need to confirm your identity first, and we will reply within
        30 days. You can update your name, email and password yourself from your account settings.
      </p>

      <h2 id="children">9. Children</h2>
      <p>
        Interflect is not meant for children under 13. Learners between 13 and 18 need a parent or guardian’s consent.
        If you believe a child has given us information without that consent, contact us and we will delete it.
      </p>

      <h2 id="complaints">10. Complaints</h2>
      <p>
        Please contact us first so we can try to help. You can also complain to the Information Regulator (South
        Africa) at{" "}
        <a href="https://inforegulator.org.za" rel="noopener" target="_blank">inforegulator.org.za</a>, or to the
        data protection authority where you live.
      </p>

      <h2 id="changes">11. Changes to this policy</h2>
      <p>
        We will update this policy when how we handle information changes, and change the date at the top. If a change
        is significant, we will tell you by email or on the site.
      </p>
    </LegalPage>
  );
}
