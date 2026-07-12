"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function QuotePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleGoogleLogin = async () => {
    const redirectUrl = window.location.origin + '/auth/callback';
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      alert('Please login with Google first');
      return;
    }
    setSubmitted(true);
  };

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold mb-4">Get a Quote</h1>
          <p className="text-gray-600 mb-6">Please login with Google to request a quote.</p>
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Get a Quote</h1>
      <p className="text-gray-600">Logged in as {user.email}</p>
      {submitted ? (
        <div className="bg-green-100 p-4 rounded-lg mt-4">
          <p className="text-green-700">✅ Request submitted!</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full border p-3 rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location"
            className="w-full border p-3 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
          <button type="submit" className="bg-indigo-600 text-white px-6 py-3 rounded">
            Submit Quote Request
          </button>
        </form>
      )}
    </div>
  );
}