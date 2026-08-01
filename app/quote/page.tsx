"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function QuoteForm() {
  const searchParams = useSearchParams();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [plotArea, setPlotArea] = useState(searchParams.get('plotSize') || '');
  const [budget, setBudget] = useState(searchParams.get('estimatedCost') || '');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({
full_name: name,
mobile_number: mobile,
plot_location: city,
budget: budget,
service_required: 'quote_request',
remarks: [
'Lead created from Website Quote Form',
plotArea ? `Plot Area: ${plotArea} sq.ft.` : ''
].filter(Boolean).join('\n'),
source: 'website',
current_page: window.location.pathname,
}),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.error || data.message || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <h1 className="text-3xl font-bold text-gray-900">✅ Request Submitted!</h1>
<p className="text-gray-600 mt-2">{"We'll get back to you shortly."}</p>
          <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline">
            Go back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Get a Quote</h1>
          <p className="text-gray-600 mt-2 text-center">
Tell us about your project and {"we'll"} get back to you shortly.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile *
              </label>
              <input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City *
              </label>
              <input
                id="city"
                type="text"
                placeholder="Enter your city"
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="plotArea" className="block text-sm font-medium text-gray-700">
                Plot Area (sq.ft.)
              </label>
              <input
                id="plotArea"
                type="text"
                placeholder="e.g. 1200"
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={plotArea}
                onChange={(e) => setPlotArea(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget
              </label>
              <input
                id="budget"
                type="text"
                placeholder="e.g. ₹50,00,000"
                className="mt-1 w-full border border-gray-300 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
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
        </div>
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <QuoteForm />
    </Suspense>
  );
}