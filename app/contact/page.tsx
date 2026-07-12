"use client";

import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useState, useEffect } from 'react';

// ✅ Client Side पर Supabase बनाएँ (Build Time पर नहीं)
let supabase: any = null;

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isReady, setIsReady] = useState(false);

  // ✅ Supabase Client को Client Side पर Initialize करें
  useEffect(() => {
    if (!supabase) {
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
    }
    setIsReady(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isReady || !supabase) {
      setError('Please wait, loading...');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: supabaseError } = await supabase.from('contact_leads').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      message: form.message,
      location: form.location,
      status: 'new',
    });

    if (supabaseError) {
      setError('Failed to submit. Please try again.');
      console.error('Error submitting contact:', supabaseError.message);
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
    setForm({ name: '', email: '', phone: '', message: '', location: '' });
  };

  if (submitted) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <nav className="bg-white shadow-sm border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-2xl font-bold text-indigo-700">SBBT <span className="text-gray-800">Construction</span></Link>
            </div>
          </div>
        </nav>
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-12 rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold text-green-600">Thank You!</h1>
            <p className="mt-4 text-gray-600">Your message has been sent. We'll get back to you shortly.</p>
            <Link href="/" className="mt-6 inline-block text-indigo-600 hover:underline">Return Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-indigo-700">
              SBBT <span className="text-gray-800">Construction</span>
            </Link>
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/projects" className="text-gray-600 hover:text-indigo-600">Projects</Link>
              <Link href="/#packages" className="text-gray-600 hover:text-indigo-600">Packages</Link>
              <Link href="/#testimonials" className="text-gray-600 hover:text-indigo-600">Testimonials</Link>
              <Link href="/contact" className="text-indigo-600 font-medium">Contact</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900">Get in <span className="text-indigo-600">Touch</span></h1>
            <p className="text-gray-500 mt-2">Fill in the form and we'll get back to you.</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location (City/Area)</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Message *</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
              <ul className="mt-4 space-y-3 text-gray-600">
                <li><span className="font-medium text-gray-900">📍 Office:</span> SBBT Constructions, Mumbai</li>
                <li><span className="font-medium text-gray-900">📞 Phone:</span> +91 98765 43210</li>
                <li><span className="font-medium text-gray-900">✉️ Email:</span> info@sbbtconstruction.com</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-2">Find Us</h3>
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                Google Map Location
              </div>
              <p className="mt-2 text-xs text-gray-400">(Add your Google Map embed code here later)</p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl">
              <h3 className="font-bold text-indigo-800">Office Hours</h3>
              <p className="text-gray-600 mt-2">Mon–Sat: 9:00 AM – 6:00 PM</p>
              <p className="text-gray-600">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          &copy; 2026 SBBT Construction. All rights reserved.
        </div>
      </footer>
    </div>
  );
}