import { prisma } from "@/lib/db/prisma";
import { unstable_cache } from "next/cache";

// ─── Revalidate helper ───
// Call this after any content mutation to bust the cache
export async function revalidateMarketingContent() {
// Next.js 15: revalidateTag
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("marketing-content");
  } catch {
// Fallback for older Next.js
  }
}

// ─── Site Content (key/value blocks) ───

export const getSiteContent = unstable_cache(
  async (page?: string) => {
    const where = page ? { page, isActive: true } : { isActive: true };
    const items = await prisma.siteContent.findMany({
      where,
      orderBy: [{ page: "asc" }, { sortOrder: "asc" }],
    });
    return items.reduce(
      (acc, item) => {
        acc[item.contentKey] = item.value;
        return acc;
      },
      {} as Record<string, string>
    );
  },
  ["site-content"],
  { tags: ["marketing-content"], revalidate: 60 }
);

export async function getSiteContentByKey(key: string): Promise<string | null> {
  const all = await getSiteContent();
  return all[key] ?? null;
}

// ─── Page Config ───

export const getPageConfig = unstable_cache(
  async (pageKey: string) => {
    return prisma.sitePageConfig.findUnique({
      where: { pageKey },
    });
  },
  ["page-config"],
  { tags: ["marketing-content"], revalidate: 60 }
);

// ─── Navigation ───

export const getNavigation = unstable_cache(
  async (location: "HEADER" | "FOOTER") => {
    const items = await prisma.navigationItem.findMany({
      where: { location, isActive: true, parentId: null },
      orderBy: { sortOrder: "asc" },
      include: {
        children: { where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return items;
  },
  ["navigation"],
  { tags: ["marketing-content"], revalidate: 60 }
);

// ─── Testimonials ───

export const getVisibleTestimonials = unstable_cache(
  async (limit?: number) => {
    return prisma.testimonial.findMany({
      where: { visible: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: limit,
    });
  },
  ["testimonials"],
  { tags: ["marketing-content"], revalidate: 60 }
);

// ─── Pricing ───

export const getActivePricing = unstable_cache(
  async (area?: string) => {
    const where = area
      ? { area, isActive: true }
      : { isActive: true };
    const tiers = await prisma.pricingTier.findMany({
      where,
      orderBy: [{ area: "asc" }, { durationMinutes: "asc" }],
    });
    return tiers.map((tier) => ({
      ...tier,
      price: Number(tier.price),
    }));
  },
  ["pricing"],
  { tags: ["marketing-content"], revalidate: 60 }
);

export async function getPricingByArea(area: string) {
  const all = await getActivePricing(area);
  return all;
}

// ─── Service Areas ───

export const getActiveServiceAreas = unstable_cache(
  async () => {
    return prisma.serviceArea.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { town: "asc" }],
    });
  },
  ["service-areas"],
  { tags: ["marketing-content"], revalidate: 60 }
);

// ─── FAQs ───

export const getActiveFaqs = unstable_cache(
  async (category?: string) => {
    const where = category
      ? { category, isActive: true }
      : { isActive: true };
    const items = await prisma.faqItem.findMany({
      where,
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });
// Group by category
    const grouped = items.reduce(
      (acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, typeof items>
    );
    return grouped;
  },
  ["faqs"],
  { tags: ["marketing-content"], revalidate: 60 }
);
