import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/instructor/dashboard", "/admin"],
    },
    sitemap: "https://movemytest.co.uk/sitemap.xml",
  };
}
