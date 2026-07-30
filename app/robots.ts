import { MetadataRoute } from "next";

// ============================================================
// robots.txt Generation
// SBBT CRM Next.js Project
//
// Controls search engine crawling permissions.
// ============================================================

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/login/", "/quote/"],
      },
    ],
    host: "https://sbbt.in",
    sitemap: "https://sbbt.in/sitemap.xml",
  };
}