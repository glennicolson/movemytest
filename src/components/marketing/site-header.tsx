import { SiteHeaderClient } from "./site-header-client";
import { HEADER_NAV_ITEMS } from "./nav-data";

export async function SiteHeader() {
  // Nav items are now hardcoded — the previous getNavigation() call
  // hit a non-existent Prisma model and silently returned empty.
  const items = HEADER_NAV_ITEMS;
  return <SiteHeaderClient items={items} />;
}
