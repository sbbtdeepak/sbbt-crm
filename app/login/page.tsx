"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

let supabase: any = null;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    setIsReady(true);

    // ✅ TypeScript Error Fix: `data` का Type `any` Set करें
    supabase.auth.getUser().then(({ data }: { data: any }) => {
      if (data?.user) {
        router.push('/dashboard');
      }
      setLoading(false);
    });
  }, [router]);

  const handleGoogleLogin = async () => {
  if (!isReady || !supabase) {
    alert('Please wait...');
    return;
  }

  // ✅ सीधा Live URL डालें (हार्ड-कोडेड)
  const redirectUrl = 'https://sbbt-crm-new-seven.vercel.app/auth/callback';

  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectUrl,
    },
  });
};
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">SBBT CRM</h1>
        <p className="text-gray-600 mb-6">Admin login ke liye Google account se sign in karein.</p>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}