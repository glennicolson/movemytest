import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - MoveMyTest",
  description: "How MoveMyTest collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-950">Privacy Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: May 2026</p>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
        <p>
          MoveMyTest (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, store, and safeguard your personal information when you use our test swap service.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">2. Information we collect</h2>
        <p>We collect the following types of information:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li><strong>Account information</strong> — Email address, password (hashed), mobile number, and ADI number (for instructors).</li>
          <li><strong>Test details</strong> — Current test centre, test date, desired swap direction, and preferred alternative centres.</li>
          <li><strong>Usage data</strong> — How you interact with the site, including pages visited and features used.</li>
          <li><strong>Communication data</strong> — Messages sent through our support system and contact forms.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">3. How we use your information</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>To match you with suitable test swap partners.</li>
          <li>To manage your account and provide customer support.</li>
          <li>To send important notifications about your listings and matches.</li>
          <li>To improve our service and develop new features.</li>
          <li>To comply with legal obligations and prevent fraud.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">4. Data sharing</h2>
        <p>
          We do not sell your personal data. We only share information with:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Other users — Only the information necessary to facilitate a test swap (e.g., test centre, date range).</li>
          <li>Service providers — Trusted third parties who help us operate the site (hosting, email delivery).</li>
          <li>Legal authorities — When required by law or to protect our rights.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">5. Data security</h2>
        <p>
          We use industry-standard security measures including encryption, secure servers, and regular security audits. Passwords are hashed using scrypt. Booking references are encrypted at rest.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">6. Your rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your account and data.</li>
          <li>Withdraw consent for marketing communications.</li>
          <li>Lodge a complaint with the UK Information Commissioner&apos;s Office (ICO).</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">7. Data retention</h2>
        <p>
          We retain your data for as long as necessary to provide our service and comply with legal obligations. When you delete your account, we remove or anonymise your personal data within 30 days.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">8. Contact us</h2>
        <p>
          For privacy-related questions, contact{" "}
          <a href="mailto:support@movemytest.co.uk" className="text-[var(--brand)] underline hover:text-[var(--brand-strong)]">
            support@movemytest.co.uk
          </a>.
        </p>
      </section>
    </main>
  );
}
