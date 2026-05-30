# MoveMyTest SEO Audit — May 2026

## Executive Summary

**Overall Score: 62/100** — Good foundation with critical issues to fix.

**Status:** The site has solid basic SEO (sitemap, robots.txt, metadata on key pages) but has inherited DTC schema data, broken canonical URLs, missing metadata on many pages, and no Open Graph images.

---

## Critical Issues (Fix First)

### 1. ❌ Schema.org Data is Wrong (Inherited from DTC)
**Impact: HIGH** — Google may display incorrect business information in search results.

**Problem:** `src/components/seo/schemas.ts` contains DTC driving school data:
- Telephone: `0800-011-2122` (DTC number)
- Address: Edinburgh, Scotland (DTC location)
- Services: "90-Minute Driving Lesson", "Block of 10 Hours"
- SameAs links: Facebook/TheDTC, X.com/TheDTC
- Description mentions "Tailored driving lessons across Edinburgh"

**Fix:** Update all schema data to reflect MoveMyTest as a **test swap matching service**, not a driving school.

### 2. ❌ Canonical URLs Point to localhost
**Impact: HIGH** — Search engines may not index the correct URLs.

**Affected pages:**
- `/support-us` → canonical: `http://localhost:6003/support-us`
- `/test-centres` → canonical: `http://localhost:6003/test-centres`
- `/how-it-works` → canonical: `http://localhost:6003/how-it-works`
- `/why-use-the-dtc-movemytest` → canonical: `http://localhost:6003/...`
- `/instructor` → canonical: `http://localhost:6003/instructor`

**Fix:** Change all to `https://movemytest.co.uk/...`

### 3. ❌ Missing Open Graph Images
**Impact: MEDIUM** — Social shares look broken/unprofessional.

**Problem:** Pages reference `/opengraph-image` but only `og-default.svg` exists in public folder. No proper PNG/JPG for social sharing.

**Affected pages:** Homepage, test-centres, how-it-works, instructor, why-use-movemytest.

**Fix:** Create a 1200x630px Open Graph image (PNG) and save as `public/opengraph-image.png`.

### 4. ❌ Missing Metadata on Many Pages
**Impact: MEDIUM** — Pages won't rank well or display properly in search.

**Pages without metadata exports:**
- `/instructor/dashboard/*` (11 pages)
- `/dashboard/*` (8+ pages)
- `/instructor/register-success`
- `/instructor/verify-email`
- `/instructor/mfa`
- `/instructor/forgot-password`
- `/forgot-password`
- `/reset-password`
- `/mfa`
- `/login`
- `/register`

**Note:** Some of these (dashboard pages) have `robots: { index: false }` which is correct — they should not be indexed. But login/register pages should have metadata.

---

## Important Issues (Fix Soon)

### 5. ⚠️ Page Title Could Be Better
**Impact: MEDIUM**

**Current homepage title:** "MoveMyTest — Free, Privacy-First Driving MoveMyTests"

**Problem:** "MoveMyTests" looks like a typo. Should be "MoveMyTest" or "Driving Test Swaps".

**Suggested:** "MoveMyTest — Free Private Driving Test Swap Service | DVSA Compliant"

### 6. ⚠️ No Hreflang Tags
**Impact: LOW** — Site targets UK only, but hreflang helps with regional search.

**Fix:** Add `<link rel="alternate" hreflang="en-gb" href="..." />` to pages.

### 7. ⚠️ Missing Structured Data on Key Pages
**Impact: MEDIUM**

**Problem:** Homepage has breadcrumb + FAQ schema but is missing:
- WebSite schema with SearchAction (for Google sitelinks search)
- Organization schema (for knowledge panel)

### 8. ⚠️ `/start` Page Missing Canonical
**Impact: LOW**

**Problem:** `/start` page has metadata but no `alternates: { canonical }` export.

---

## Good SEO Practices (Keep)

### ✅ Sitemap.xml
- Generated dynamically at `/sitemap.xml`
- Includes 9 URLs with priorities and change frequencies
- Correctly excludes `/dashboard`, `/instructor/dashboard`, `/admin` via robots.txt

### ✅ Robots.txt
- Disallows private areas correctly
- Points to correct sitemap URL

### ✅ Mobile-Friendly
- Responsive design with proper viewport meta
- Next.js handles this automatically

### ✅ Semantic HTML
- Proper heading hierarchy (h1 → h2 → h3)
- Landmark elements (header, nav, main, footer)
- FAQ content uses `<details>`/`<summary>` elements (good for SEO)

### ✅ JSON-LD Structured Data
- BreadcrumbList schema on key pages
- FAQPage schema on homepage and test centre pages
- HowTo schema on `/how-it-works`

### ✅ Meta Descriptions
- Present on key public pages
- Under 160 characters
- Include target keywords

### ✅ Footer Links
- Privacy Policy, Terms of Service, Cookies Policy links present
- Helps with crawlability and trust signals

---

## Recommendations

### Priority 1: Fix Schemas & Canonicals (This Week)
1. Update `src/components/seo/schemas.ts` with MoveMyTest data
2. Fix all localhost canonical URLs
3. Create proper Open Graph image

### Priority 2: Add Missing Metadata (Next Sprint)
1. Add metadata to `/login`, `/register`, `/start`
2. Add WebSite + Organization schema to homepage
3. Add hreflang tags

### Priority 3: Content SEO (Ongoing)
1. Add alt text to decorative images (if any real images added)
2. Add more internal linking between pages
3. Create blog content for long-tail keywords

### Priority 4: Technical SEO (Post-launch)
1. Implement Core Web Vitals monitoring
2. Add server-side rendering for dynamic pages
3. Implement proper caching headers

---

## Quick Wins

1. **Fix canonicals** — 5 minutes, high impact
2. **Create OG image** — 30 minutes, medium impact
3. **Fix schema data** — 1 hour, high impact
4. **Update homepage title** — 2 minutes, medium impact

---

## Keywords to Target

Based on current content:
- "driving test swap" (primary)
- "DVSA test swap"
- "swap driving test"
- "driving test exchange"
- "move my driving test"
- "change driving test date"
- "driving test swap UK"
- "free driving test swap"

## Competitor Gap

The site does not currently rank for:
- "driving test cancellation" (high volume)
- "change driving test centre"
- "driving test waiting list"

Consider adding content targeting these terms.
