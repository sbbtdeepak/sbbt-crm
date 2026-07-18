"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
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
  thumbnail?: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error.message);
        setLoading(false);
        return;
      }

      setProjects(data || []);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="pt-28 max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
            Our <span className="text-indigo-600">Projects</span>
          </h1>
          <p className="mt-1.5 text-xs text-gray-500">Explore our completed and ongoing construction projects.</p>
        </div>

        <div className="max-w-7xl mx-auto">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">No projects added yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {projects.map((project) => (
                <a href={`/projects/${project.id}`} key={project.id}>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md border border-slate-200 hover:shadow-lg transition cursor-pointer group">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-36 object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-36 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No Image</div>
                    )}
                    <div className="p-3">
                      <h2 className="text-sm font-semibold text-gray-900">{project.name}</h2>
                      <p className="text-gray-500 text-[10px] uppercase mt-0.5">{project.location || 'Location not specified'}</p>
                      <div className="mt-2 flex justify-between items-center">
                        <span className="text-[10px] font-medium text-indigo-600">₹{project.project_value?.toLocaleString() || 0}</span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${
                          project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          project.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}