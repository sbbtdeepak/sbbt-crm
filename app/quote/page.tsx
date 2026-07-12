"use client";

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function QuotePage() {
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please login with Google first');
      return;
    }
    // यहाँ Quotation Save करें (Supabase Table में)
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Get a Quote</h1>
      {submitted ? (
        <div className="bg-green-100 p-4 rounded-lg mt-4">
          <p className="text-green-700">✅ Your request has been submitted!</p>
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
          <button
            type="submit"
            className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700"
          >
            Submit Quote Request
          </button>
        </form>
      )}
    </div>
  );
}