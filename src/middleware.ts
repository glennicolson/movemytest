import { NextRequest, NextResponse } from "next/server";

/**
 * Canonical domain enforcement
 * Prevents search engines from indexing non-canonical hosts (e.g. Hostinger subdomain)
 */
const CANONICAL_HOSTS = process.env.CANONICAL_HOSTS?.split(",").filter(Boolean) ?? ["movemytest.co.uk"];

/**
 * Helper that returns a canonical redirect URL when the request host
 * does not match one of the approved canonical hosts.
 * Disabled in development / localhost to allow local testing.
 */
function getCanonicalRedirectUrl(request: NextRequest): URL | null {
  const host = request.headers.get("host") || "";

  // Skip canonical redirect in development or on localhost
  if (
    process.env.NODE_ENV === "development" ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1")
  ) {
    return null;
  }

  const canonicalHost = CANONICAL_HOSTS.find((h) => host.includes(h)) ?? null;

  if (!canonicalHost) {
    // No canonical match — redirect to the first canonical host
    const url = request.nextUrl.clone();
    url.host = CANONICAL_HOSTS[0];
    url.port = "";
    url.protocol = "https:";
    return url;
  }

  return null;
}

/**
 * Middleware — runs on every request.
 */
export function middleware(request: NextRequest) {
  const canonicalRedirectUrl = getCanonicalRedirectUrl(request);

  if (canonicalRedirectUrl) {
    // Redirect any non-canonical host to the canonical domain.
    // Use a 308 permanent redirect so search engines consolidate.
    const response = NextResponse.redirect(canonicalRedirectUrl, 308);
    // Also tell search engines not to index the non-canonical URL.
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
