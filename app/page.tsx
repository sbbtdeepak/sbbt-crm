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
  thumbnail?: string | null;
};

type Package = {
  id: string;
  name: string;
  price: number;
  inclusions: string[];
  is_active: boolean;
};

type Testimonial = {
  id: string;
  client_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
};

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Check Auth Status
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

      // 2. Fetch Projects (केवल 3 होमपेज के लिए)
      const { data: projectsData } = await supabase
        .from('projects')
        .select(`*, project_images (image_url)`)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6);

      const formattedProjects = (projectsData || []).map((p: any) => ({
        ...p,
        thumbnail: p.project_images?.length > 0 ? p.project_images[0].image_url : null,
      }));
      setProjects(formattedProjects);

      // 3. Fetch Active Packages
      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      setPackages(packagesData || []);

      // 4. Fetch Featured Testimonials
      const { data: testimonialsData } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6);
      setTestimonials(testimonialsData || []);

      setLoading(false);
    };

    fetchData();

    // Scroll effect for navbar
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* ---------- NAVBAR ---------- */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-700">
              SBBT <span className="text-gray-800">Construction</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#projects" className="text-gray-600 hover:text-indigo-600 transition">Projects</Link>
              <Link href="#packages" className="text-gray-600 hover:text-indigo-600 transition">Packages</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition">Testimonials</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition">Contact</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                  Dashboard
                </Link>
              ) : (
                <Link href="/admin" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition">
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Build Your <span className="text-yellow-300">Dream Space</span> with SBBT
              </h1>
              <p className="mt-6 text-lg text-indigo-100 leading-relaxed">
                Premium construction services tailored to your needs. From foundation to finishing,
                we bring architectural excellence to life.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/quote" className="bg-white text-indigo-700 px-8 py-3 rounded-full font-semibold hover:bg-indigo-50 transition shadow-lg transform hover:scale-105 duration-300">
                  Get Quote Now
                </Link>
                <Link href="/admin" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-700 transition">
                  Admin Login
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Construction"
                className="rounded-2xl shadow-2xl object-cover w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROJECTS SECTION ---------- */}
      <section id="projects" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our <span className="text-indigo-600">Completed Projects</span></h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Transforming spaces into magnificent realities.</p>
          </div>
          {projects.length === 0 ? (
            <p className="text-center text-gray-400">No projects added yet. Admin can add them from the dashboard.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-xl transition duration-300">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} className="w-full h-56 object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-gray-500 mt-1">{project.location || 'Location not specified'}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-medium text-indigo-600">₹{project.project_value?.toLocaleString() || 0}</span>
                      <span className={`text-xs px-3 py-1 rounded-full ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- PACKAGES SECTION ---------- */}
      <section id="packages" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Our <span className="text-indigo-600">Construction Packages</span></h2>
            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">Choose the best plan that suits your construction needs.</p>
          </div>
          {packages.length === 0 ? (
            <p className="text-center text-gray-400">No packages added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">₹{pkg.price.toLocaleString()}</p>
                  <ul className="mt-4 space-y-2">
                    {pkg.inclusions?.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-gray-600 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> {item}
                      </li>
                    ))}
                    {pkg.inclusions?.length > 3 && <li className="text-gray-400 text-xs">+{pkg.inclusions.length - 3} more</li>}
                  </ul>
                  <Link href="/quote" className="mt-6 block text-center border border-indigo-600 text-indigo-600 py-2 rounded-full hover:bg-indigo-600 hover:text-white transition font-semibold">
                    Get Quote
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- TESTIMONIALS SECTION ---------- */}
      <section id="testimonials" className="py-16 md:py-24 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">What <span className="text-indigo-600">Clients Say</span></h2>
          </div>
          {testimonials.length === 0 ? (
            <p className="text-center text-gray-400">No testimonials yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300">
                  <div className="flex text-yellow-400 text-lg">{'⭐'.repeat(item.rating || 5)}</div>
                  <p className="text-gray-700 mt-3 italic">"{item.content}"</p>
                  <div className="mt-4 font-semibold text-gray-900">{item.client_name}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white">SBBT</h3>
              <p className="text-gray-400 mt-2 text-sm">Building excellence since 2025.</p>
            </div>
            <div>
              <h4 className="font-semibold">Quick Links</h4>
              <ul className="mt-2 space-y-1 text-gray-400 text-sm">
                <li><Link href="#projects">Projects</Link></li>
                <li><Link href="#packages">Packages</Link></li>
                <li><Link href="#testimonials">Testimonials</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Contact</h4>
              <ul className="mt-2 space-y-1 text-gray-400 text-sm">
                <li>Email: info@sbbt.com</li>
                <li>Phone: +91 98765 43210</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Admin</h4>
              <Link href="/admin" className="text-indigo-400 text-sm hover:underline">Login to Dashboard</Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            &copy; 2025 SBBT Construction. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}