import { createClient } from "@/lib/supabase/server";
import { getAllPackages, getMediaItems } from "./actions";
import CompanyForm from "./components/CompanyForm";
import HomepageForm from "./components/HomepageForm";
import SEOForm from "./components/SEOForm";
import SocialForm from "./components/SocialForm";
import SettingsForm from "./components/SettingsForm";
import InternalSettingsForm from "./components/InternalSettingsForm";
import PackagesSection from "./components/PackagesSection";
import ProjectsSection from "./components/ProjectsSection";
import BlogsSection from "./components/BlogsSection";
import TestimonialsSection from "./components/TestimonialsSection";
import BrandsSection from "./components/BrandsSection";
import MediaManager from "./components/MediaManager";
import type {
  CMSCompanyRow,
  CMSHomepageRow,
  CMSSEORow,
  CMSSocialRow,
  CMSSettingsRow,
  CMSInternalSettingsRow,
  CMSPackageFull,
  CMSMediaItem,
} from "./types";
import { DEFAULT_SITE_ID } from "./types";

// Tab types
type TabType = "company" | "homepage" | "seo" | "social" | "settings" | "internal" | "packages" | "projects" | "blogs" | "testimonials" | "brands" | "media";

// Tab configuration
const tabs: Array<{ id: TabType; label: string }> = [
  { id: "company", label: "Company" },
  { id: "homepage", label: "Homepage" },
  { id: "seo", label: "SEO" },
  { id: "social", label: "Social" },
  { id: "settings", label: "Settings" },
  { id: "internal", label: "Internal" },
  { id: "packages", label: "Packages" },
  { id: "projects", label: "Projects" },
  { id: "blogs", label: "Blogs" },
  { id: "testimonials", label: "Testimonials" },
  { id: "brands", label: "Brands" },
  { id: "media", label: "Media" },
];

export default async function CMSPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // Load all CMS data in parallel
  const supabase = await createClient();

  const [
    companyresult,
    homepageresult,
    seoresult,
    socialresult,
    settingsresult,
    internalSettingsresult,
  ] = await Promise.all([
    supabase.from("cms_company").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_homepage").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_seo").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_social").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_settings").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_internal_settings").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
  ]);

  const company = companyresult.data as CMSCompanyRow | null;
  const homepage = homepageresult.data as CMSHomepageRow | null;
  const seo = seoresult.data as CMSSEORow | null;
  const social = socialresult.data as CMSSocialRow | null;
  const settings = settingsresult.data as CMSSettingsRow | null;
  const internalSettings = internalSettingsresult.data as CMSInternalSettingsRow | null;

  const error =
    companyresult.error?.message ||
    homepageresult.error?.message ||
    seoresult.error?.message ||
    socialresult.error?.message ||
    settingsresult.error?.message ||
    internalSettingsresult.error?.message ||
    null;

  // Fetch packages and media items only when needed (lazy loading)
  let packages: CMSPackageFull[] = [];
  let mediaItems: CMSMediaItem[] = [];
  
  // Get tab from search params (default to company)
  const params = await searchParams;
  const activeTab: TabType = (params.tab as TabType) || "company";
  
  if (activeTab === "packages") {
    packages = await getAllPackages() as unknown as CMSPackageFull[];
  } else if (activeTab === "media") {
    mediaItems = await getMediaItems() as CMSMediaItem[];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CMS Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage company information, homepage, SEO, social links, settings,
          internal configuration, packages, projects, blogs, testimonials, and media.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200"
          role="alert"
        >
          Error loading CMS data: {error}
        </div>
      )}

      {/* Mobile Responsive Tabs */}
      <div className="border-b border-gray-200">
        <nav
          className="-mb-px flex space-x-8 overflow-x-auto"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`/dashboard/cms?tab=${tab.id}`}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }
                transition-colors
              `}
              aria-current={activeTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "company" && <CompanyForm company={company} />}
        {activeTab === "homepage" && <HomepageForm homepage={homepage} />}
        {activeTab === "seo" && <SEOForm seo={seo} />}
        {activeTab === "social" && <SocialForm social={social} />}
        {activeTab === "settings" && <SettingsForm settings={settings} />}
        {activeTab === "internal" && <InternalSettingsForm settings={internalSettings} />}
        {activeTab === "packages" && <PackagesSection initialPackages={packages} />}
        {activeTab === "projects" && <ProjectsSection />}
        {activeTab === "blogs" && <BlogsSection />}
        {activeTab === "testimonials" && <TestimonialsSection />}
        {activeTab === "brands" && <BrandsSection />}
        {activeTab === "media" && <MediaManager initialItems={mediaItems} activeFolder="" />}
      </div>
    </div>
  );
}
