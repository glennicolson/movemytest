import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy - MoveMyTest",
  description: "How MoveMyTest uses cookies and similar technologies.",
};

export default function CookiePolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-bold text-slate-950">Cookie Policy</h1>
      <p className="mt-2 text-sm text-slate-500">Last updated: May 2026</p>

      <section className="mt-8 space-y-4 text-slate-700">
        <h2 className="text-xl font-semibold text-slate-900">What are cookies?</h2>
        <p>
          Cookies are small text files placed on your device when you visit a website. They help the site remember your preferences and improve your experience.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">How we use cookies</h2>
        <p>MoveMyTest uses cookies for the following purposes:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Essential cookies</strong> — Required for the site to function, including user authentication, session management, and security.
          </li>
          <li>
            <strong>Preference cookies</strong> — Remember your settings and choices (e.g., cookie consent, UI preferences).
          </li>
          <li>
            <strong>Analytics cookies</strong> — Help us understand how visitors interact with the site so we can improve it.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-900">Third-party cookies</h2>
        <p>
          We do not use advertising or tracking cookies from third-party networks. Any third-party cookies are limited to essential services such as hosting infrastructure and error monitoring.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Managing cookies</h2>
        <p>
          You can control or delete cookies through your browser settings. Please note that disabling essential cookies may prevent parts of MoveMyTest from working correctly.
        </p>

        <h2 className="text-xl font-semibold text-slate-900">Contact us</h2>
        <p>
          If you have questions about our Cookie Policy, please contact us at{" "}
          <a href="mailto:support@movemytest.co.uk" className="text-[var(--brand)] underline hover:text-[var(--brand-strong)]">
            support@movemytest.co.uk
          </a>.
        </p>
      </section>
    </main>
  );
}
