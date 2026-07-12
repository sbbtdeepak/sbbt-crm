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
    const redirectUrl = window.location.origin + '/auth/callback?returnTo=/quote';
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

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Get a Quote</h1>
          <p className="text-gray-600 mt-2">Login to request a quote</p>
          <button
            onClick={handleGoogleLogin}
            className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-xl hover:bg-red-700 transition"
          >
            Continue with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Get a Quote</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition text-sm"
          >
            Logout
          </button>
        </div>
        <p className="text-gray-600 mt-2">Logged in as {user.email}</p>

        {submitted ? (
          <div className="bg-green-100 p-6 rounded-xl mt-6 text-center">
            <h2 className="text-2xl font-bold text-green-700">✅ Request Submitted!</h2>
            <p className="text-gray-600 mt-2">We'll get back to you shortly.</p>
            <a href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
              Go back to Home
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
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
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quote Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}