"use client";

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
        <Header />
        <div className="max-w-xl mx-auto px-4 py-12 text-center pt-24">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h1 className="text-xl font-bold text-green-600">Thank You!</h1>
            <p className="mt-2 text-gray-600 text-sm">Your message has been sent. We will get back to you shortly.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      <div className="pt-24 max-w-4xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h1 className="text-xl font-bold text-gray-900">Get in <span className="text-indigo-600">Touch</span></h1>
            <p className="text-gray-500 mt-1.5 text-xs">Fill in the form and we will get back to you.</p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Location (City/Area)</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="mt-1 w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Message *</label>
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border border-gray-300 p-2.5 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                />
              </div>

              {error && <p className="text-red-500 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 text-xs font-semibold"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Contact Info & Map */}
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-gray-900">Contact Information</h2>
              <ul className="mt-3 space-y-2 text-gray-600 text-xs">
                <li><span className="font-medium text-gray-900">Office:</span> SBBT Constructions, Mumbai</li>
                <li><span className="font-medium text-gray-900">Phone:</span> +91 98765 43210</li>
                <li><span className="font-medium text-gray-900">Email:</span> info@sbbtconstruction.com</li>
              </ul>
            </div>

            <div className="bg-white p-3 rounded-xl shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-1.5 text-xs">Find Us</h3>
              <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                Google Map Location
              </div>
              <p className="mt-1.5 text-[10px] text-gray-400">(Add your Google Map embed code here later)</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl">
              <h3 className="font-bold text-indigo-800 text-xs">Office Hours</h3>
              <p className="text-gray-600 mt-1 text-xs">Mon–Sat: 9:00 AM – 6:00 PM</p>
              <p className="text-gray-600 text-xs">Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}