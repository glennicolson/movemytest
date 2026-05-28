import { getNavigation } from "@/features/marketing-content/queries";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  const navItems = await getNavigation("HEADER");

  const items = navItems.map((item: any) => ({
    title: item.label,
    href: item.href,
    openInNewTab: item.openInNewTab,
    description: item.description ?? undefined,
    icon: item.icon ?? undefined,
    children: item.children?.map((child: any) => ({
      title: child.label,
      href: child.href,
      openInNewTab: child.openInNewTab,
      description: child.description ?? undefined,
      icon: child.icon ?? undefined,
    })) ?? [],
  }));

  return <SiteHeaderClient items={items} />;
}
