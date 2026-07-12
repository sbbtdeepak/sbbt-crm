"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HomePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // ✅ अगर User Login है → Dashboard दिखाओ
  if (user) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Logged in as {user.email}</p>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.reload();
            }}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h2 className="font-semibold">Projects</h2>
              <p className="text-sm text-gray-600">Manage your projects</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h2 className="font-semibold">Packages</h2>
              <p className="text-sm text-gray-600">Manage packages</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h2 className="font-semibold">Testimonials</h2>
              <p className="text-sm text-gray-600">Manage testimonials</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ❌ अगर User Login नहीं है → Homepage (Hero Section + Buttons) दिखाओ
  return (
    <div className="min-h-screen bg-white">
      {/* ---------- HERO SECTION ---------- */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Build Your <span className="text-indigo-600">Dream Space</span> with SBBT
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Premium construction services tailored to your needs. From foundation to finishing,
                we bring architectural excellence to life.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/quote" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition shadow-lg shadow-green-200">
                  Get Quote Now
                </Link>
                <Link href="/admin" className="bg-gray-900 text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition">
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

      {/* ---------- FOOTER ---------- */}
      <footer className="bg-gray-900 text-white py-8 text-center text-sm">
        &copy; 2026 SBBT Construction. All rights reserved.
      </footer>
    </div>
  );
}