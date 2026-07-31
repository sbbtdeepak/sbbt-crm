// ============================================================
// SEO Structured Data Utilities
// SBBT CRM Next.js Project
//
// Provides reusable JSON-LD schema generators for
// Organization, LocalBusiness, and ConstructionBusiness.
// ============================================================

const COMPANY = {
  name: "Shree Badree Build Tech Pvt Ltd",
  alternateName: "SBBT",
  url: "https://sbbt.in",
  logo: "https://sbbt.in/logo.png",
  description:
    "Premium Residential Construction Company in Delhi NCR providing turnkey construction, interior designing, renovation, and architectural services.",
  areaServed: "Delhi NCR",
  addressCountry: "IN",
  priceRange: "₹₹₹",
  serviceTypes: [
    "Residential Construction",
    "Turnkey Construction",
    "Interior Designing",
    "House Construction",
    "Villa Construction",
    "Commercial Construction",
    "Renovation",
    "Architecture",
    "Construction Management",
  ],
};

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${COMPANY.url}/#organization`,
    name: COMPANY.name,
    alternateName: COMPANY.alternateName,
    url: COMPANY.url,
    logo: COMPANY.logo,
    description: COMPANY.description,
  };
}

export function localBusinessSchema() {
  return {
    "@type": "LocalBusiness",
    "@id": `${COMPANY.url}/#localbusiness`,
    name: COMPANY.name,
    alternateName: COMPANY.alternateName,
    url: COMPANY.url,
    logo: COMPANY.logo,
    description: COMPANY.description,
    areaServed: {
      "@type": "City",
      name: COMPANY.areaServed,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: COMPANY.addressCountry,
    },
    priceRange: COMPANY.priceRange,
  };
}

export function constructionBusinessSchema() {
  return {
    "@type": "ConstructionBusiness",
    "@id": `${COMPANY.url}/#constructionbusiness`,
    name: COMPANY.name,
    alternateName: COMPANY.alternateName,
    url: COMPANY.url,
    logo: COMPANY.logo,
    description: COMPANY.description,
    areaServed: {
      "@type": "City",
      name: COMPANY.areaServed,
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: COMPANY.addressCountry,
    },
    priceRange: COMPANY.priceRange,
    serviceType: COMPANY.serviceTypes,
  };
}

export function enterpriseJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      localBusinessSchema(),
      constructionBusinessSchema(),
    ],
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${COMPANY.url}${item.path}`,
    })),
  };
}

export function reviewSchema(
  reviews: { author: string; reviewBody: string; ratingValue: number }[],
  aggregateRating?: { ratingValue: number; reviewCount: number; bestRating?: number; worstRating?: number }
) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Review",
    "reviewBody": reviews[0]?.reviewBody || "",
    "author": {
      "@type": "Person",
      "name": reviews[0]?.author || "Customer",
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": reviews[0]?.ratingValue || 5,
      "bestRating": 5,
      "worstRating": 1,
    },
  };

  if (aggregateRating) {
    schema["aggregateRating"] = {
      "@type": "AggregateRating",
      "ratingValue": aggregateRating.ratingValue,
      "reviewCount": aggregateRating.reviewCount,
      "bestRating": aggregateRating.bestRating || 5,
      "worstRating": aggregateRating.worstRating || 1,
    };
  }

  return schema;
}

export function testimonialsToReviewSchema(testimonials: { client_name: string; testimonial: string; rating: number }[]) {
  if (!testimonials.length) return null;

  const avgRating =
    testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / testimonials.length;

  const reviews = testimonials.map((t) => ({
    author: t.client_name || "Customer",
    reviewBody: t.testimonial || "",
    ratingValue: t.rating || 5,
  }));

  return reviewSchema(reviews, {
    ratingValue: Math.round(avgRating * 10) / 10,
    reviewCount: testimonials.length,
    bestRating: 5,
    worstRating: 1,
  });
}

export function faqSchema(items: { question: string; answer: string }[]) {
  if (!items.length) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer,
      },
    })),
  };
}
