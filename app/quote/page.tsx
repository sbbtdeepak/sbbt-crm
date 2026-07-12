"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Link from 'next/link';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      alert('Please login with Google first');
      setIsSubmitting(false);
      return;
    }

    console.log('✅ Quotation submitted by:', currentUser.email);
    console.log('📞 Phone:', phone);
    console.log('📍 Location:', location);

    setSubmitted(true);
    setIsSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // ✅ अगर User Login नहीं है → Google Login Button
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

  // ✅ अगर User Login है → Quotation Form + Logout Button
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Get a Quote</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
        >
          Logout
        </button>
      </div>
      <p className="text-gray-600 mt-2">Logged in as {user.email}</p>

      {submitted ? (
        <div className="bg-green-100 p-4 rounded-lg mt-4">
          <p className="text-green-700">✅ Your request has been submitted!</p>
          <Link href="/" className="text-indigo-600 hover:underline mt-2 inline-block">
            Go back to Home
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              className="w-full border p-3 rounded mt-1"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location *</label>
            <input
              type="text"
              placeholder="Enter your location"
              className="w-full border p-3 rounded mt-1"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
          </button>
        </form>
      )}
    </div>
  );
}