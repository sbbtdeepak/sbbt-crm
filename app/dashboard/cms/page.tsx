import CompanyForm from "./components/CompanyForm";
import HomepageForm from "./components/HomepageForm";
import SEOForm from "./components/SEOForm";
import SocialForm from "./components/SocialForm";
import SettingsForm from "./components/SettingsForm";
import InternalSettingsForm from "./components/InternalSettingsForm";
import PackagesSection from "./components/PackagesSection";
import ProjectsSection from "./components/ProjectsSection";
import { createClient } from "@/lib/supabase/server";
import type {
  CMSCompanyRow,
  CMSHomepageRow,
  CMSSEORow,
  CMSSocialRow,
  CMSSettingsRow,
  CMSInternalSettingsRow,
} from "./types";
import { DEFAULT_SITE_ID } from "./types";

// Tab types
type TabType = "company" | "homepage" | "seo" | "social" | "settings" | "internal" | "packages" | "projects";

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
];

export default async function CMSPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // Load all CMS data in parallel
  const supabase = await createClient();

  const [
    companyResult,
    homepageResult,
    seoResult,
    socialResult,
    settingsResult,
    internalSettingsResult,
  ] = await Promise.all([
    supabase.from("cms_company").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_homepage").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_seo").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_social").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_settings").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
    supabase.from("cms_internal_settings").select("*").eq("site_id", DEFAULT_SITE_ID).maybeSingle(),
  ]);

  const company = companyResult.data as CMSCompanyRow | null;
  const homepage = homepageResult.data as CMSHomepageRow | null;
  const seo = seoResult.data as CMSSEORow | null;
  const social = socialResult.data as CMSSocialRow | null;
  const settings = settingsResult.data as CMSSettingsRow | null;
  const internalSettings = internalSettingsResult.data as CMSInternalSettingsRow | null;

  const error =
    companyResult.error?.message ||
    homepageResult.error?.message ||
    seoResult.error?.message ||
    socialResult.error?.message ||
    settingsResult.error?.message ||
    internalSettingsResult.error?.message ||
    null;

  // Get tab from search params (default to company)
  const params = await searchParams;
  const activeTab: TabType = (params.tab as TabType) || "company";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">CMS Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage company information, homepage, SEO, social links, settings, internal configuration, packages, and projects.
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
        {activeTab === "packages" && <PackagesSection />}
        {activeTab === "projects" && <ProjectsSection />}
      </div>
    </div>
  );
}