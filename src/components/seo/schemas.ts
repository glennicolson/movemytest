import { appConfig } from "@/lib/config/app";

/** LocalBusiness + DrivingSchool schema for the homepage and site-wide use */
export function drivingSchoolSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    name: "MoveMyTest",
    alternateName: "MoveMyTest",
    url: appConfig.publicAppUrl,
    logo: `${appConfig.publicAppUrl}/apple-touch-icon.png`,
    description:
      "Tailored driving lessons across Edinburgh, The Lothians, Dumfries and Fife. DVSA-approved instructors, manual and automatic, multiple languages. Established 2003.",
    telephone: "0800-011-2122",
    email: "hello@movemytest.co.uk",
    areaServed: [
      { "@type": "City", name: "Edinburgh" },
      { "@type": "City", name: "Dunfermline" },
      { "@type": "City", name: "Dumfries" },
      { "@type": "City", name: "Dunbar" },
      { "@type": "City", name: "Lockerbie" },
      { "@type": "City", name: "Musselburgh" },
      { "@type": "City", name: "Dalkeith" },
      { "@type": "City", name: "Penicuik" },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Edinburgh",
      addressRegion: "Scotland",
      addressCountry: "GB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "55.9533",
      longitude: "-3.1883",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday"],
        opens: "09:00",
        closes: "16:00",
      },
    ],
    priceRange: "££",
    sameAs: [
      "https://www.facebook.com/TheDTC",
      "https://x.com/TheDTC",
      "https://www.youtube.com/@movemytest",
    ],
    knowsAbout: [
      "DVSA driving tests",
      "manual driving lessons",
      "automatic driving lessons",
      "theory test preparation",
      "ADI instructor training",
      "learner driver safeguarding",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Driving Lessons",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "90-Minute Driving Lesson",
            description: "90-minute driving lesson with a DVSA-approved instructor.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "2-Hour Driving Lesson",
            description: "2-hour driving lesson with a DVSA-approved instructor.",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Block of 10 Hours",
            description: "Block booking of 10 hours of driving lessons at a discounted rate.",
          },
        },
      ],
    },
  };
}

/** FAQPage schema for the FAQ page */
export function faqSchema(
  categories: { category: string; items: { question: string; answer: string }[] }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categories.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    ),
  };
}

/** BreadcrumbList schema */
export function breadcrumbSchema(
  items: { name: string; href: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${appConfig.publicAppUrl}${item.href}`,
    })),
  };
}

/** Product/Offer schema for the prices page */
export function lessonPricingSchema(
  areas: { area: string; transmission: string; ninetyMin: string; twoHour: string; blockTen: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "MoveMyTest Driving Lesson Prices",
    itemListElement: areas.map((area, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "OfferCatalog",
        name: `Driving Lessons — ${area.area}`,
        description: `${area.transmission} driving lessons in ${area.area} from The MoveMyTest.`,
        itemListElement: [
          {
            "@type": "Offer",
            price: area.ninetyMin === "N/A" ? undefined : area.ninetyMin.replace("£", ""),
            priceCurrency: "GBP",
            itemOffered: {
              "@type": "Service",
              name: "90-Minute Driving Lesson",
              description: `90-minute ${area.transmission.toLowerCase()} driving lesson in ${area.area}.`,
            },
          },
          {
            "@type": "Offer",
            price: area.twoHour === "N/A" ? undefined : area.twoHour.replace("£", ""),
            priceCurrency: "GBP",
            itemOffered: {
              "@type": "Service",
              name: "2-Hour Driving Lesson",
              description: `2-hour ${area.transmission.toLowerCase()} driving lesson in ${area.area}.`,
            },
          },
          {
            "@type": "Offer",
            price: area.blockTen === "N/A" ? undefined : area.blockTen.replace("£", ""),
            priceCurrency: "GBP",
            itemOffered: {
              "@type": "Service",
              name: "Block of 10 Hours",
              description: `Block booking of 10 hours of ${area.transmission.toLowerCase()} driving lessons in ${area.area}.`,
            },
          },
        ],
      },
    })),
  };
}

/** Organization schema for entity verification and sameAs linking */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MoveMyTest",
    alternateName: "MoveMyTest",
    url: appConfig.publicAppUrl,
    logo: `${appConfig.publicAppUrl}/apple-touch-icon.png`,
    description:
      "DVSA-approved driving school established 2003. Tailored driving lessons across Edinburgh, The Lothians, Fife, and Dumfries & Galloway. Manual and automatic lessons with multilingual instructors.",
    telephone: "0800-011-2122",
    email: "hello@movemytest.co.uk",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Edinburgh",
      addressRegion: "Scotland",
      addressCountry: "GB",
    },
    sameAs: [
      "https://www.facebook.com/TheDTC",
      "https://x.com/TheDTC",
      "https://www.youtube.com/@movemytest",
    ],
    foundingDate: "2003",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      value: "6+",
    },
  };
}

/** WebSite + SearchAction schema for site-level SEO */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MoveMyTest",
    alternateName: "MoveMyTest",
    url: appConfig.publicAppUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${appConfig.publicAppUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function absoluteSiteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http:/") || pathOrUrl.startsWith("https://")) return pathOrUrl;
  return `${appConfig.publicAppUrl}${pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`}`;
}

export function articleSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  authorName?: string | null;
  publishDate?: Date | null;
  updatedAt?: Date | null;
  featuredImage?: string | null;
  categories?: string[];
  tags?: string[];
}) {
  const authorName = post.authorName?.trim() || "The MoveMyTest Editorial Team";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: `${appConfig.publicAppUrl}/blog/${post.slug}`,
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage ? [absoluteSiteUrl(post.featuredImage)] : undefined,
    datePublished: post.publishDate?.toISOString(),
    dateModified: (post.updatedAt ?? post.publishDate ?? new Date()).toISOString(),
    articleSection: post.categories?.[0] ?? "Driving Lessons",
    keywords: post.tags?.join(", ") ?? "driving lessons, DVSA, Scotland",
    user: {
      "@type": authorName === "The MoveMyTest Editorial Team" || authorName === "The MoveMyTest Team" ? "Organization" : "Person",
      name: authorName,
      url: `${appConfig.publicAppUrl}/editorial-policy`,
      description:
        "Content reviewed by DVSA-approved driving instructors with practical teaching experience across Edinburgh, The Lothians, Fife, and Dumfries & Galloway.",
    },
    publisher: {
      "@type": "Organization",
      name: "MoveMyTest",
      alternateName: "MoveMyTest",
      url: appConfig.publicAppUrl,
      logo: {
        "@type": "ImageObject",
        url: `${appConfig.publicAppUrl}/apple-touch-icon.png`,
      },
    },
  };
}

export function howToSchema(input: {
  name: string;
  description: string;
  url: string;
  steps: { name: string; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    description: input.description,
    url: `${appConfig.publicAppUrl}${input.url}`,
    step: input.steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  };
}

export function reviewsSchema(input: {
  url: string;
  averageRating: number | null;
  reviews: { authorName: string; rating: number; reviewedAt: Date; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DrivingSchool",
    name: "MoveMyTest",
    alternateName: "MoveMyTest",
    url: `${appConfig.publicAppUrl}${input.url}`,
    aggregateRating:
      input.averageRating && input.reviews.length
        ? {
            "@type": "AggregateRating",
            ratingValue: input.averageRating,
            reviewCount: input.reviews.length,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: input.reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      user: { "@type": "Person", name: review.authorName },
      datePublished: review.reviewedAt.toISOString().slice(0, 10),
      reviewBody: review.text,
      reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    })),
  };
}
