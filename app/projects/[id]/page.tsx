"use client";

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Project = {
  id: string;
  name: string;
  client_name: string;
  cid: string;
  package: string;
  project_value: number;
  plot_area: string;
  road_facing: string;
  floors: number;
  status: string;
  rating: number;
  location: string;
  timeline: string;
  features: string[];
  project_images: { image_url: string }[];
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`*, project_images (image_url)`)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching project:', error.message);
        setLoading(false);
        return;
      }

      setProject(data);
      setLoading(false);
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-2xl font-light text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-2xl font-light text-gray-600">Project not found.</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
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

      {/* Project Detail */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/projects" className="text-indigo-600 hover:underline mb-6 inline-block">&larr; Back to Projects</Link>

        <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
        <p className="text-gray-500 mt-1">{project.location}</p>

        {/* Images Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
          {project.project_images && project.project_images.length > 0 ? (
            project.project_images.map((img, idx) => (
              <img key={idx} src={img.image_url} alt={project.name} className="rounded-lg object-cover w-full h-48 shadow-md" />
            ))
          ) : (
            <div className="col-span-3 text-gray-400 text-center py-12">No images available.</div>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-8 mt-12 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">Project Details</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><span className="font-medium">Client:</span> {project.client_name || 'N/A'}</li>
              <li><span className="font-medium">CID:</span> {project.cid || 'N/A'}</li>
              <li><span className="font-medium">Package:</span> {project.package || 'N/A'}</li>
              <li><span className="font-medium">Value:</span> ₹{project.project_value?.toLocaleString() || 0}</li>
              <li><span className="font-medium">Plot Area:</span> {project.plot_area || 'N/A'}</li>
              <li><span className="font-medium">Road Facing:</span> {project.road_facing || 'N/A'}</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-700">More Info</h3>
            <ul className="mt-4 space-y-2 text-gray-600">
              <li><span className="font-medium">Floors:</span> {project.floors || 0}</li>
              <li><span className="font-medium">Status:</span> <span className={`px-2 py-1 rounded-full text-xs ${
                project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                project.status === 'ongoing' ? 'bg-yellow-100 text-yellow-700' : 
                'bg-blue-100 text-blue-700'
              }`}>{project.status}</span></li>
              <li><span className="font-medium">Rating:</span> {project.rating || 0} ⭐</li>
              <li><span className="font-medium">Timeline:</span> {project.timeline || 'N/A'}</li>
            </ul>
          </div>
        </div>

        {/* Features */}
        {project.features && project.features.length > 0 && (
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700">Features</h3>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {project.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-gray-600">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> {feature}
                </li>
              ))}
            </ul>
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