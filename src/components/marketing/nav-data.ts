/**
 * Hardcoded navigation data for the MMT site.
 *
 * Previously, this came from a CMS-style layer (getNavigation /
 * getSiteContent / etc. in marketing-content/queries.ts) backed by
 * a NavigationItem table. The MarketingContent tables don't exist
 * on the MMT schema — they were never migrated from DTC. The
 * queries returned `undefined` for `prisma.navigationItem` and
 * Next.js silently swallowed the error, leaving the navigation
 * always-empty in dev and prod.
 *
 * To unblock the navigation, the data is now hardcoded here. If
 * you need to edit nav items, edit this file. A future refactor
 * could add a MarketingContent model to the MMT schema and
 * repoint getNavigation at it.
 *
 * This matches the nav structure that was in the site when we
 * converted (verified against the live site HTML on 2026-06-08):
 *  - Header: Home, Start Listing, Test Centres, How it Works, For Instructors, Support Us
 *  - Footer: Legal section + Contact section
 *
 * HISTORY: this file used to import `NavItem` from
 * `./site-header-client`, but that client component was unused
 * dead code in the MMT app (MMT uses `@/components/movemytest/site-header`,
 * not the marketing one). The type was inlined here on 2026-06-08
 * so the footer can keep working without pulling in a 200KB
 * framer-motion dep.
 */

export interface NavItem {
  title: string;
  href: string;
}

export const HEADER_NAV_ITEMS: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Start Listing", href: "/start" },
  { title: "Test Centres", href: "/test-centres" },
  { title: "How it Works", href: "/how-it-works" },
  { title: "For Instructors", href: "/instructor" },
  { title: "Support Us", href: "/support-us" },
];

export interface FooterSection {
  title: string;
  links: Array<{ label: string; href: string; openInNewTab?: boolean }>;
}

export const FOOTER_NAV_SECTIONS: FooterSection[] = [
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookies Policy", href: "/cookies-policy" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "About", href: "/about" },
    ],
  },
];
