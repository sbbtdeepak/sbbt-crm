"use client";

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
        .select(`*, project_images (image_url)`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error.message);
        setLoading(false);
        return;
      }

      const formatted = (data || []).map((p: any) => ({
        ...p,
        thumbnail: p.project_images?.length > 0 ? p.project_images[0].image_url : null,
      }));
      setProjects(formatted);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-2xl font-light text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar (Copied from homepage) */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-700">
              SBBT <span className="text-gray-800">Construction</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/projects" className="text-indigo-600 font-medium">Projects</Link>
              <Link href="/#packages" className="text-gray-600 hover:text-indigo-600">Packages</Link>
              <Link href="/#testimonials" className="text-gray-600 hover:text-indigo-600">Testimonials</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-gray-900">Our <span className="text-indigo-600">Projects</span></h1>
          <p className="mt-2 text-gray-500">Explore our completed and ongoing construction projects.</p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {projects.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No projects added yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link href={`/projects/${project.id}`} key={project.id}>
                <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer group">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                    <p className="text-gray-500 mt-1">{project.location || 'Location not specified'}</p>
                    <div className="mt-4 flex flex-wrap justify-between items-center gap-2">
                      <span className="text-sm font-medium text-indigo-600">₹{project.project_value?.toLocaleString() || 0}</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        project.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; 2026 SBBT Construction. All rights reserved.
        </div>
      </footer>
    </div>
  );
}