// ============================================================
// SEO Metadata Utilities
// SBBT CRM Next.js Project
//
// Provides helper functions for generating dynamic metadata
// for packages, projects, and blogs using CMS data with
// fallback values from company settings.
// ============================================================

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_ID } from "@/app/dashboard/cms/types";

export type CompanySeoFallback = {
  siteName: string;
  description: string;
  keywords: string;
  logoUrl: string;
};

export async function getCompanySeoFallback(): Promise<CompanySeoFallback> {
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("cms_company")
    .select("brand_name, tagline, logo_url")
    .eq("site_id", DEFAULT_SITE_ID)
    .maybeSingle();

  const brandName = company?.brand_name?.trim() || "SBBT";
  const tagline = company?.tagline?.trim() || "";
  const logoUrl = company?.logo_url?.trim() || "https://sbbt.in/logo.png";

  const description =
    tagline ||
    "Premium Residential Construction Company in Delhi NCR providing turnkey construction, interior designing, renovation, and architectural services.";

  const keywords =
    "construction company, residential construction, turnkey construction, home builder, Delhi NCR construction, SBBT, Shree Badree Build Tech";

  return {
    siteName: brandName,
    description,
    keywords,
    logoUrl,
  };
}

export function buildListingMetadata(params: {
  title: string;
  description: string;
  keywords?: string;
  path: string;
  fallback: CompanySeoFallback;
  ogImage?: string;
}) {
  const { title, description, keywords, path, fallback, ogImage } = params;

  const url = `https://sbbt.in${path}`;
  const siteName = fallback.siteName;
  const finalKeywords = keywords || fallback.keywords;

  return {
    title: {
      default: `${title} | ${siteName}`,
      template: `%s | ${siteName}`,
    },
    description: description || fallback.description,
    keywords: finalKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      title: `${title} | ${siteName}`,
      description: description || fallback.description,
      images:
        ogImage ||
        fallback.logoUrl || 
        "/og-image.jpg",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description: description || fallback.description,
    },
    metadataBase: new URL("https://sbbt.in"),
  };
}

export function buildItemMetadata(params: {
  title: string;
  description: string;
  keywords?: string;
  path: string;
  fallback: CompanySeoFallback;
  ogImage?: string;
}) {
  const { title, description, keywords, path, fallback, ogImage } = params;

  const url = `https://sbbt.in${path}`;
  const siteName = fallback.siteName;
  const finalKeywords = keywords || fallback.keywords;

  return {
    title: {
      default: `${title} | ${siteName}`,
      template: `%s | ${siteName}`,
    },
    description: description || fallback.description,
    keywords: finalKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName,
      title: `${title} | ${siteName}`,
      description: description || fallback.description,
      images:
        ogImage ||
        fallback.logoUrl || 
        "/og-image.jpg",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} | ${siteName}`,
      description: description || fallback.description,
    },
    metadataBase: new URL("https://sbbt.in"),
  };
}