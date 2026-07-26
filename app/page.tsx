import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

import Hero from "@/components/home/Hero";
import HomePackages from "@/components/home/Packages";
import Projects from "@/components/home/Projects";
import GoogleReviews from "@/components/home/GoogleReviews";
import Testimonials from "@/components/home/Testimonials";
import Blogs from "@/components/home/Blogs";
import CTA from "@/components/home/CTA";
import ConstructionEstimator from "@/components/home/ConstructionEstimator";
import Brands from "@/components/home/Brands";
import ReferEarn from "@/components/home/ReferEarn";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";
import type { CMSPackageFull } from "@/app/dashboard/cms/types";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch active packages (V3 schema)
  const { data: packages } = await supabase
    .from('cms_packages')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const pkgIds = (packages || []).map((p: { id: number }) => p.id);

  // Fetch sections for all packages
  const { data: sections } = await supabase
    .from('cms_package_sections')
    .select('*')
    .in('package_id', pkgIds.length > 0 ? pkgIds : [0])
    .order('display_order', { ascending: true });

  const sectionIds = (sections || []).map((s: { id: number }) => s.id);

  // Fetch items for all sections
  const { data: items } = await supabase
    .from('cms_package_items')
    .select('*')
    .in('section_id', sectionIds.length > 0 ? sectionIds : [0])
    .order('display_order', { ascending: true });

  // Build nested structure
  const itemsBySection: Record<number, Array<{ item: string; brand: string; specification: string; remarks: string }>> = {};
  for (const item of items || []) {
    const secId = item.section_id as number;
    if (!itemsBySection[secId]) itemsBySection[secId] = [];
    itemsBySection[secId].push({
      item: item.item as string,
      brand: item.brand as string,
      specification: item.specification as string,
      remarks: item.remarks as string,
    });
  }

  const sectionsByPackage: Record<number, Array<{ id: number; title: string; display_order: number; items: Array<{ item: string; brand: string; specification: string; remarks: string }> }>> = {};
  for (const section of sections || []) {
    const pkgId = section.package_id as number;
    if (!sectionsByPackage[pkgId]) sectionsByPackage[pkgId] = [];
    sectionsByPackage[pkgId].push({
      id: section.id as number,
      title: section.title as string,
      display_order: section.display_order as number,
      items: itemsBySection[section.id as number] || [],
    });
  }

  const homePackages: CMSPackageFull[] = (packages || []).map((pkg: Record<string, unknown>) => ({
    package: {
      id: pkg.id as number,
      site_id: pkg.site_id as string,
      name: pkg.name as string,
      slug: pkg.slug as string,
      price: pkg.price as number,
      description: pkg.description as string,
      display_order: pkg.display_order as number,
      is_active: pkg.is_active as boolean,
      state_id: pkg.state_id as string | null,
      created_at: pkg.created_at as string | null,
      updated_at: pkg.updated_at as string | null,
      created_by: pkg.created_by as string | null,
      updated_by: pkg.updated_by as string | null,
    },
    sections: sectionsByPackage[pkg.id as number] || [],
  }));

  return (
    <>
      <Header />

      <Hero />

      <HomePackages packages={homePackages} />

      <ConstructionEstimator />

      <Projects />

      <GoogleReviews />

      <WhyChooseUs />

      <Brands />

      <ReferEarn />

      <Testimonials />

      <FAQ />

      <Blogs />

      <CTA />

      <Footer />
    </>
  );
}
