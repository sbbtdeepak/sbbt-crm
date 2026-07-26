"use client";

import { createClient } from "@/lib/supabase/client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

type Project = {
  id: string;
  name: string;
  client_name: string;
  project_value: string;
  status: string;
  location: string;
  plot_area: string;
  floors: string;
  description?: string;
  start_date?: string;
  completion_date?: string;
  cover_image_url?: string;
};

type ProjectImage = {
  image_url: string;
  caption?: string;
};

type BeforeAfterItem = {
  id: number;
  image_url: string;
  caption?: string;
  type: "before" | "after";
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [beforeImages, setBeforeImages] = useState<BeforeAfterItem[]>([]);
  const [afterImages, setAfterImages] = useState<BeforeAfterItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('cms_projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching project:', error.message);
        setLoading(false);
        return;
      }

      setProject(data);

      // Fetch project gallery images
      const { data: imagesData } = await supabase
        .from('cms_project_gallery')
        .select('image_url, caption')
        .eq('project_id', params.id)
        .order('display_order', { ascending: true });

      setImages(imagesData || []);

      // Fetch before/after images (stored as individual rows with type field)
      const { data: beforeAfterData } = await supabase
        .from('cms_project_before_after')
        .select('id, image_url, caption, type')
        .eq('project_id', params.id)
        .order('display_order', { ascending: true });

      if (beforeAfterData) {
        setBeforeImages(beforeAfterData.filter((item: BeforeAfterItem) => item.type === 'before'));
        setAfterImages(beforeAfterData.filter((item: BeforeAfterItem) => item.type === 'after'));
      }

      setLoading(false);
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">Project not found</h1>
          <Link href="/projects" className="mt-3 inline-block text-indigo-600 text-xs hover:underline">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <Link href="/projects" className="inline-flex items-center text-indigo-600 text-xs hover:underline mb-4">
          &#x2190; Back to Projects
        </Link>

        <div className="bg-white rounded-xl overflow-hidden shadow-md">
          {/* Cover Image */}
          {project.cover_image_url && (
            <div className="w-full">
              <img
                src={project.cover_image_url}
                alt={project.name}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Gallery Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 p-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img.image_url}
                    alt={img.caption || `${project.name} - Image ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {img.caption && (
                    <p className="mt-1 text-[10px] text-slate-500">{img.caption}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Before/After Section */}
          {(beforeImages.length > 0 || afterImages.length > 0) && (
            <div className="px-3 pb-3">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Before & After</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {beforeImages.map((item, idx) => {
                  const after = afterImages[idx];
                  return (
                    <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-2">
                        <div>
                          <p className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-1 text-center">Before</p>
                          <img src={item.image_url} alt={`Before ${idx + 1}`} className="w-full h-36 object-cover" />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 text-center">After</p>
                          <img src={after?.image_url || ''} alt={`After ${idx + 1}`} className="w-full h-36 object-cover" />
                        </div>
                      </div>
                      {item.caption && (
                        <p className="text-[10px] text-slate-500 px-2 py-1 text-center border-t border-slate-100">{item.caption}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Project Info */}
          <div className="p-4 md:p-5">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-500 text-xs mt-0.5">{project.location}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                project.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>

            {project.description && (
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-gray-900 mb-1.5">Description</h2>
                <p className="text-gray-600 text-xs leading-relaxed">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <div className="text-[9px] text-gray-500">Client</div>
                <div className="font-semibold text-gray-900 text-xs">{project.client_name}</div>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <div className="text-[9px] text-gray-500">Project Value</div>
                <div className="font-semibold text-gray-900 text-xs">{project.project_value || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <div className="text-[9px] text-gray-500">Plot Area</div>
                <div className="font-semibold text-gray-900 text-xs">{project.plot_area || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg">
                <div className="text-[9px] text-gray-500">Floors</div>
                <div className="font-semibold text-gray-900 text-xs">{project.floors || 'N/A'}</div>
              </div>
            </div>

            {(project.start_date || project.completion_date) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {project.start_date && (
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <div className="text-[9px] text-gray-500">Start Date</div>
                    <div className="font-semibold text-gray-900 text-xs">
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {project.completion_date && (
                  <div className="bg-gray-50 p-2.5 rounded-lg">
                    <div className="text-[9px] text-gray-500">Completion Date</div>
                    <div className="font-semibold text-gray-900 text-xs">
                      {new Date(project.completion_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}