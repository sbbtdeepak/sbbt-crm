"use client";

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useState, useEffect } from 'react';

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
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);

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

      const { data: packagesData } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });
      setPackages(packagesData || []);

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
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-extrabold text-indigo-700">SBBT</span>
              <span className="text-2xl font-light text-gray-700">Construction</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#projects" className="text-gray-600 hover:text-indigo-600 transition font-medium">Projects</Link>
              <Link href="#packages" className="text-gray-600 hover:text-indigo-600 transition font-medium">Packages</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-indigo-600 transition font-medium">Testimonials</Link>
              <Link href="/contact" className="text-gray-600 hover:text-indigo-600 transition font-medium">Contact</Link>
              {isLoggedIn ? (
                <Link href="/dashboard" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" className="bg-gray-900 text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">
                  Admin Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ---------- HERO SECTION ---------- */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight animate-fade-in-up">
            Build Your <span className="text-yellow-300">Dream Space</span>
            <br />
            <span className="text-white">with SBBT</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
            Premium construction services tailored to your needs. From foundation to finishing,
            we bring architectural excellence to life.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="#projects" className="bg-white text-indigo-700 px-10 py-4 rounded-full font-semibold hover:bg-indigo-50 transition shadow-2xl transform hover:scale-105 duration-300">
              View Projects
            </Link>
            <Link href="#packages" className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-semibold hover:bg-white hover:text-indigo-700 transition transform hover:scale-105 duration-300">
              Explore Packages
            </Link>
          </div>
          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-yellow-300">50+</div>
              <div className="text-indigo-200 text-sm">Projects Done</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300">100+</div>
              <div className="text-indigo-200 text-sm">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300">4.9</div>
              <div className="text-indigo-200 text-sm">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-300">10+</div>
              <div className="text-indigo-200 text-sm">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- ABOUT SECTION ---------- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">About Us</span>
              <h2 className="text-4xl font-bold text-gray-900 mt-2">Building <span className="text-indigo-600">Excellence</span> Since 2015</h2>
              <p className="mt-4 text-gray-600 leading-relaxed">
                SBBT Construction is a premier construction firm dedicated to delivering exceptional quality.
                We specialize in residential and commercial projects, ensuring every detail is crafted with precision.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-700"><span className="text-indigo-600 text-xl">✓</span> Licensed & Insured</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-indigo-600 text-xl">✓</span> Eco-Friendly Materials</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-indigo-600 text-xl">✓</span> On-Time Delivery</div>
                <div className="flex items-center gap-2 text-gray-700"><span className="text-indigo-600 text-xl">✓</span> 10-Year Warranty</div>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Construction"
                className="rounded-2xl shadow-2xl w-full object-cover h-80"
              />
              <div className="absolute -bottom-4 -right-4 bg-indigo-600 text-white p-4 rounded-xl shadow-lg">
                <div className="text-2xl font-bold">10+</div>
                <div className="text-sm">Years</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROJECTS SECTION ---------- */}
      <section id="projects" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Portfolio</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Our <span className="text-indigo-600">Completed Projects</span></h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">Transforming spaces into magnificent realities.</p>
          </div>
          {projects.length === 0 ? (
            <p className="text-center text-gray-400">No projects added yet. Admin can add them from the dashboard.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div key={project.id} className="group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:shadow-2xl transition duration-500">
                  <div className="relative overflow-hidden">
                    {project.thumbnail ? (
                      <img src={project.thumbnail} alt={project.name} className="w-full h-64 object-cover group-hover:scale-110 transition duration-700" />
                    ) : (
                      <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-500 flex items-end p-4">
                      <Link href={`/projects/${project.id}`} className="bg-white text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-600 hover:text-white transition">
                        View Details
                      </Link>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                    <p className="text-gray-500 mt-1">{project.location || 'Location not specified'}</p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-semibold text-indigo-600">₹{project.project_value?.toLocaleString() || 0}</span>
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
      <section id="packages" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Pricing</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">Construction <span className="text-indigo-600">Packages</span></h2>
            <p className="mt-2 text-gray-500 max-w-2xl mx-auto">Choose the best plan that suits your construction needs.</p>
          </div>
          {packages.length === 0 ? (
            <p className="text-center text-gray-400">No packages added yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-2xl transition duration-300 hover:-translate-y-2">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                  <p className="text-3xl font-bold text-indigo-600 mt-2">₹{pkg.price.toLocaleString()}</p>
                  <ul className="mt-4 space-y-2">
                    {pkg.inclusions?.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="text-gray-600 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> {item}
                      </li>
                    ))}
                    {pkg.inclusions?.length > 3 && (
                      <li className="text-gray-400 text-xs">+{pkg.inclusions.length - 3} more</li>
                    )}
                  </ul>
                  <Link href="/login" className="mt-6 block text-center border border-indigo-600 text-indigo-600 py-2 rounded-full hover:bg-indigo-600 hover:text-white transition font-semibold">
                    Get Quote
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- TESTIMONIALS SECTION ---------- */}
      <section id="testimonials" className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-indigo-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-4xl font-bold text-gray-900 mt-2">What <span className="text-indigo-600">Clients Say</span></h2>
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

      {/* ---------- CONTACT / FOOTER ---------- */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold">SBBT</h3>
            <p className="text-gray-400 mt-2 text-sm">Building excellence since 2015.</p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">📘</a>
              <a href="#" className="text-gray-400 hover:text-white transition">📷</a>
              <a href="#" className="text-gray-400 hover:text-white transition">🐦</a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="mt-2 space-y-1 text-gray-400 text-sm">
              <li><Link href="#projects" className="hover:text-white transition">Projects</Link></li>
              <li><Link href="#packages" className="hover:text-white transition">Packages</Link></li>
              <li><Link href="#testimonials" className="hover:text-white transition">Testimonials</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <ul className="mt-2 space-y-1 text-gray-400 text-sm">
              <li>📍 Mumbai, India</li>
              <li>📞 +91 98765 43210</li>
              <li>✉️ info@sbbt.com</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Admin</h4>
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-indigo-400 hover:underline text-sm">Go to Dashboard</Link>
            ) : (
              <Link href="/login" className="text-indigo-400 hover:underline text-sm">Login to Dashboard</Link>
            )}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; 2026 SBBT Construction. All rights reserved.
        </div>
      </footer>
    </div>
  );
}