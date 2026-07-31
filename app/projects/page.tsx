"use client";

import { breadcrumbSchema } from '@/lib/seo/schema';

const breadcrumbs = breadcrumbSchema([
  { name: 'Home', path: '/' },
  { name: 'Projects', path: '/projects' },
]);

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import PageHero from '@/components/shared/PageHero';
import GoogleReviews from '@/components/home/GoogleReviews';
import Testimonials from '@/components/home/Testimonials';
import Blogs from '@/components/home/Blogs';
import CTA from '@/components/home/CTA';

// BreadcrumbList JSON-LD is injected once via the script below
const jsonLd = breadcrumbs;

type Project = {
  id: string;
  name: string;
  client_name: string;
  project_value: number;
  status: string;
  location: string;
  plot_area: string;
  floors: number;
  thumbnail?: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchProjects = async () => {
      // Fetch projects with their first gallery image as thumbnail fallback
      const { data, error } = await supabase
        .from('cms_projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // For each project, try to get the first gallery image as thumbnail
      const projectIds = data.map(p => p.id);
      const { data: galleryData } = await supabase
        .from('cms_project_gallery')
        .select('project_id, image_url')
        .in('project_id', projectIds)
        .order('display_order', { ascending: true });

      // Create a map of project_id -> first image
      const thumbnailMap: Record<string, string> = {};
      if (galleryData) {
        for (const img of galleryData) {
          if (!thumbnailMap[img.project_id]) {
            thumbnailMap[img.project_id] = img.image_url;
          }
        }
      }

      const mapped = data.map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        client_name: p.client_name as string,
        project_value: p.project_value as number,
        status: p.status as string,
        location: p.location as string,
        plot_area: p.plot_area as string,
        floors: p.floors as number,
        thumbnail: (p.thumbnail as string) || thumbnailMap[p.id as string] || null,
      }));

      setProjects(mapped);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <PageHero title="Our Projects" subtitle="Explore our completed and ongoing construction projects." />

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-xs">Loading projects...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">No projects added yet.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {projects.map((project) => (
                <Link href={`/projects/${project.id}`} key={project.id}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                    <div className="relative overflow-hidden aspect-[4/3]">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                      )}
                      <span className={`absolute top-2 right-2 text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="p-2.5">
                      <h2 className="text-[11px] font-semibold text-gray-900 sm:text-sm">{project.name}</h2>
                      <p className="text-gray-500 text-[9px] uppercase mt-0.5 sm:text-[10px]">{project.location || 'Location not specified'}</p>
                      <p className="mt-1 text-[9px] font-medium text-indigo-600 sm:text-xs">₹{project.project_value?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Post-Project Sections */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <GoogleReviews />
          <Testimonials />
          <Blogs />
          <CTA />
        </div>
      </main>

      <Footer />
    </div>
  );
}