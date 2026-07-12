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
    // ✅ URL से # (hash) हटाएँ
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    // ✅ अगर URL में ?reload=true है—तो Clean Reload करें
    if (window.location.search.includes('reload=true')) {
      window.location.href = window.location.pathname;
      return;
    }

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("🔍 Homepage User:", user);
      setUser(user);
      setLoading(false);
    };
    getUser();

    // ✅ Auth State Change पर User Update करें
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth State Changed:", event, session?.user);
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // ✅ अगर User Login है → पूरा Dashboard (Editable) दिखाओ
  if (user) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600 mt-2">Logged in as {user.email}</p>
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

  // ❌ अगर User Login नहीं है → Homepage दिखाओ
  return (
    <div className="min-h-screen bg-white">
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Build Your <span className="text-indigo-600">Dream Space</span> with SBBT
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                Premium construction services tailored to your needs.
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