"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push('/admin');
      } else {
        setUser(data.user);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/admin');
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600 mt-2">Logged in as {user?.email}</p>

        {/* ==== Projects, Packages, Testimonials (पुराना Code यहाँ डालें) ==== */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <h2 className="font-semibold">Projects</h2>
            <p className="text-sm text-gray-600">Manage all projects</p>
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