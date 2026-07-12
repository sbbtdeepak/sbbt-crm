"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-700">
              SBBT <span className="text-gray-800">Construction</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Build Your <span className="text-yellow-300">Dream Space</span>
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

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-indigo-600">50+</div>
              <div className="text-gray-600">Projects Done</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">100+</div>
              <div className="text-gray-600">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">4.9</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-indigo-600">10+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Why Choose <span className="text-indigo-600">SBBT</span></h2>
          <div className="grid md:grid-cols-3 gap-8 mt-10">
            <div className="bg-indigo-50 p-6 rounded-2xl text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-semibold">Quality Construction</h3>
              <p className="text-gray-600 mt-2">Premium materials and expert craftsmanship.</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-semibold">On-Time Delivery</h3>
              <p className="text-gray-600 mt-2">Projects completed within promised timelines.</p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-2xl text-center">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold">Trusted Partners</h3>
              <p className="text-gray-600 mt-2">Transparent processes and reliable service.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        <p>&copy; 2026 SBBT Construction. All rights reserved.</p>
        <div className="mt-2">
          <Link href="/admin" className="text-gray-400 hover:text-white transition text-xs">
            Admin Login
          </Link>
        </div>
      </footer>
    </div>
  );
}