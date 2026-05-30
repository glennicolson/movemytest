import { appConfig } from "@/lib/config/app";

/** Organization schema for MoveMyTest (test swap matching service) */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MoveMyTest",
    alternateName: "MoveMyTest",
    url: appConfig.publicAppUrl,
    logo: `${appConfig.publicAppUrl}/apple-touch-icon.png`,
    description:
      "Free, private, DVSA-compliant driving test swap matching service. Connecting UK learner drivers to exchange practical driving test bookings safely.",
    email: "support@movemytest.co.uk",
    address: {
      "@type": "PostalAddress",
      addressCountry: "GB",
    },
    sameAs: [
      "https://www.trustpilot.com/review/movemytest.co.uk",
    ],
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
        urlTemplate: `${appConfig.publicAppUrl}/test-centres`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** Service schema for MoveMyTest */
export function moveMyTestServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "MoveMyTest",
    provider: {
      "@type": "Organization",
      name: "MoveMyTest",
      url: appConfig.publicAppUrl,
    },
    description:
      "Free peer-to-peer driving test swap matching service. Find compatible learners to exchange DVSA practical driving test bookings safely and privately.",
    areaServed: {
      "@type": "Country",
      name: "United Kingdom",
    },
    serviceType: "Driving Test Swap Matching",
    termsOfService: `${appConfig.publicAppUrl}/terms-of-service`,
    privacyPolicy: `${appConfig.publicAppUrl}/privacy-policy`,
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

/** HowTo schema for the how-it-works page */
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

/** Reviews/AggregateRating schema */
export function reviewsSchema(input: {
  url: string;
  averageRating: number | null;
  reviews: { authorName: string; rating: number; reviewedAt: Date; text: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
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
