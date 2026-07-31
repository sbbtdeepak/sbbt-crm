import { MetadataRoute } from "next";

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