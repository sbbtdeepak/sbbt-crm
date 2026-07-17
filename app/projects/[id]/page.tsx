"use client";

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  client_name: string;
  project_value: number;
  status: string;
  location: string;
  plot_area: string;
  floors: number;
  description?: string;
  start_date?: string;
  completion_date?: string;
};

type ProjectImage = {
  image_url: string;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Error fetching project:', error.message);
        setLoading(false);
        return;
      }

      setProject(data);

      // Fetch project images
      const { data: imagesData } = await supabase
        .from('project_images')
        .select('image_url')
        .eq('project_id', params.id);

      setImages(imagesData || []);
      setLoading(false);
    };

    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
          <Link href="/projects" className="mt-4 inline-block text-indigo-600 hover:underline">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="pt-28 max-w-7xl mx-auto px-6 py-12">
        <Link href="/projects" className="inline-flex items-center text-indigo-600 hover:underline mb-6">
          &#x2190; Back to Projects
        </Link>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Project Images */}
          {images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={img.image_url}
                  alt={`${project.name} - Image ${idx + 1}`}
                  className="w-full h-80 object-cover rounded-xl"
                />
              ))}
            </div>
          )}

          {/* Project Info */}
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
                <p className="text-gray-500 mt-2">{project.location}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                project.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'
              }`}>
                {project.status}
              </span>
            </div>

            {project.description && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-500">Client</div>
                <div className="font-semibold text-gray-900">{project.client_name}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-500">Project Value</div>
                <div className="font-semibold text-gray-900">₹{project.project_value?.toLocaleString() || 0}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-500">Plot Area</div>
                <div className="font-semibold text-gray-900">{project.plot_area || 'N/A'}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="text-sm text-gray-500">Floors</div>
                <div className="font-semibold text-gray-900">{project.floors || 'N/A'}</div>
              </div>
            </div>

            {(project.start_date || project.completion_date) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.start_date && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-500">Start Date</div>
                    <div className="font-semibold text-gray-900">
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {project.completion_date && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <div className="text-sm text-gray-500">Completion Date</div>
                    <div className="font-semibold text-gray-900">
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