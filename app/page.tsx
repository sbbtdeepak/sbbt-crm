"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

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

  // ❌ अगर User Login नहीं है → Homepage दिखाओ
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900">Build Your <span className="text-indigo-600">Dream Space</span></h1>
        <p className="text-gray-600 mt-4">Welcome to SBBT Construction</p>
        <a href="/login" className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700">
          Admin Login
        </a>
      </div>
    </div>
  );
}