import Link from "next/link";
import { getNavigation } from "@/features/marketing-content/queries";
import { CookiePreferencesLink } from "@/components/marketing/cookie-preferences-link";
import { TrackedLink } from "@/components/marketing/tracked-link";
import { ObfuscatedEmail } from "@/components/marketing/obfuscated-email";

/* Inline SVG icons — no external dependency needed */
function PhoneIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 4l-10 8L2 4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http:/www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export async function SiteFooter() {
  const footerNavItems = await getNavigation("FOOTER");

// Group footer nav: top-level items become section headers, children become links
  const sections = footerNavItems.map((parent) => ({
    title: parent.label,
    links: parent.children.length
      ? parent.children.map((child) => ({ title: child.label, href: child.href, openInNewTab: child.openInNewTab }))
      : [{ title: parent.label, href: parent.href, openInNewTab: parent.openInNewTab }],
  }));

  return (
    <footer className="border-t border-white/10 bg-black text-slate-300">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-5">
          <div>
            <h2 className="text-lg font-semibold text-white">MoveMyTest</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneIcon />
                <TrackedLink href="tel:08000112122" location="footer" className="transition hover:text-[var(--brand-accent)]">0800 011 2122</TrackedLink>
                <span className="text-slate-600">|</span>
                <PhoneIcon />
                <TrackedLink href="tel:01315554134" location="footer" className="transition hover:text-[var(--brand-accent)]">0131 555 4134</TrackedLink>
              </div>
              <div className="flex items-center gap-2">
                <MobileIcon />
                <TrackedLink href="tel:07850907770" location="footer" className="transition hover:text-[var(--brand-accent)]">07850 907770</TrackedLink>
              </div>
              <div className="flex items-center gap-2">
                <WhatsAppIcon />
                <TrackedLink href="https://wa.me/447850907770" target="_blank" rel="noopener noreferrer" location="footer" className="transition hover:text-[var(--brand-accent)]">WhatsApp// Text</TrackedLink>
              </div>
              <div className="flex items-center gap-2">
                <EmailIcon />
                <ObfuscatedEmail location="footer" className="transition hover:text-[var(--brand-accent)]">Email us</ObfuscatedEmail>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <a href="https://www.facebook.com/TheDTC" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-[var(--brand-accent)]" aria-label="Facebook">
                <FacebookIcon />
              </a>
              <a href="https://www.google.com/search?q=The+Driving+Training+Centre+Edinburgh+reviews" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-[var(--brand-accent)]" aria-label="Google">
                <GoogleIcon />
              </a>
              <a href="https://x.com/TheDTC" target="_blank" rel="noopener noreferrer" className="text-slate-400 transition hover:text-[var(--brand-accent)]" aria-label="X">
                <XIcon />
              </a>
            </div>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">{section.title}</h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href as "/"}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className="text-sm text-slate-400 transition hover:text-[var(--brand-accent)]"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 border-t border-white/10 pt-6 text-xs text-slate-500">
          <div>&copy; {new Date().getFullYear()} MoveMyTest. All rights reserved. Powered By Voodoo AI.</div>
          <div className="flex gap-4">
            <CookiePreferencesLink />
            <span className="text-slate-700">|</span>
            <Link href="/sitemap" className="text-slate-400 transition hover:text-[var(--brand-accent)]">Sitemap</Link>
            <span className="text-slate-700">|</span>
            <Link href="/editorial-policy" className="text-slate-400 transition hover:text-[var(--brand-accent)]">Editorial Policy</Link>
            <span className="text-slate-700">|</span>
            <Link href="/safeguarding" className="text-slate-400 transition hover:text-[var(--brand-accent)]">Safeguarding</Link>
            <span className="text-slate-700">|</span>
            <Link href="/safeguarding/pvg-scheme" className="text-slate-400 transition hover:text-[var(--brand-accent)]">PVG Scheme</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}