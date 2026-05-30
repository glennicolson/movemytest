import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - MoveMyTest",
  description: "The terms and conditions for using MoveMyTest.",
};

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-950">Terms of Service</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: May 2026</p>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-xl font-semibold text-slate-900">1. Acceptance of Terms</h2>
        <p>
          By accessing or using MoveMyTest (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Description of Service</h2>
        <p>
          MoveMyTest is a platform that connects learner drivers who wish to swap their practical driving test appointments. We facilitate finding matches between learners with compatible test dates and locations.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">3. Eligibility</h2>
        <p>To use MoveMyTest, you must:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Be at least 17 years old (or the legal driving age in your jurisdiction).</li>
          <li>Hold a valid UK provisional driving licence.</li>
          <li>Have a confirmed driving test booking with the DVSA.</li>
          <li>Provide accurate and truthful information about your test details.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">4. User Responsibilities</h2>
        <p>When using MoveMyTest, you agree to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Provide accurate, current, and complete information about your test booking.</li>
          <li>Keep your account credentials secure and not share them with others.</li>
          <li>Use the Service only for lawful purposes and in accordance with these Terms.</li>
          <li>Not attempt to interfere with the operation of the Service or access data not intended for you.</li>
          <li>Treat other users with respect and communicate honestly about swap arrangements.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">5. The Swap Process</h2>
        <p>
          MoveMyTest helps you find potential swap partners. However, the actual test swap must be completed through the official DVSA process (typically by calling DVSA customer services). We do not guarantee that any swap will be successful.
        </p>
        <p>
          Both parties must independently verify the swap with the DVSA. MoveMyTest is not responsible for swaps that are not completed or are completed incorrectly.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Instructor Accounts</h2>
        <p>
          Driving instructors may create accounts to monitor their learners&apos; swap activity. Instructors must provide a valid ADI (Approved Driving Instructor) number. We reserve the right to verify instructor credentials.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">7. Data and Privacy</h2>
        <p>
          Your use of the Service is also governed by our{" "}
          <a href="/privacy-policy" className="text-[var(--brand)] underline hover:text-[var(--brand-strong)]">Privacy Policy</a>.
          By using MoveMyTest, you consent to the collection and use of your information as described therein.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">8. Limitation of Liability</h2>
        <p>
          MoveMyTest is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service will be uninterrupted, secure, or error-free. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the Service.
        </p>
        <p>
          Specifically, we are not responsible for:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>DVSA&apos;s decisions regarding test swaps.</li>
          <li>Any financial loss, missed tests, or other consequences of swaps.</li>
          <li>The accuracy of information provided by other users.</li>
          <li>Any disputes between users.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">9. Account Termination</h2>
        <p>
          We reserve the right to suspend or terminate your account if you violate these Terms, engage in fraudulent activity, or misuse the Service. You may delete your account at any time through your dashboard settings.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">10. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify users of significant changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the new Terms.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">11. Governing Law</h2>
        <p>
          These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">12. Contact</h2>
        <p>
          For questions about these Terms, contact{" "}
          <a href="mailto:support@movemytest.co.uk" className="text-[var(--brand)] underline hover:text-[var(--brand-strong)]">
            support@movemytest.co.uk
          </a>.
        </p>
      </section>
    </main>
  );
}
