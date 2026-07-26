"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          full_name: "Newsletter Subscriber",
          source: "newsletter",
          current_page: "/blogs",
          message: "Newsletter subscription",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Failed to subscribe. Please try again.");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      setSubmitting(false);
    } catch {
      setError("Failed to subscribe. Please try again.");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="bg-indigo-600 py-10">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-xl font-bold text-white">You're Subscribed!</h2>
          <p className="mt-1.5 text-xs text-indigo-200">
            Thank you for subscribing. We'll keep you updated with the latest insights.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-indigo-600 py-10">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-xl font-bold text-white">Stay Updated</h2>
        <p className="mt-1.5 text-xs text-indigo-200">
          Subscribe to our newsletter for the latest construction insights and updates.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 justify-center max-w-sm mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 rounded-full px-4 py-2 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-emerald-500 px-5 py-2 font-semibold text-white text-xs hover:bg-emerald-400 transition disabled:opacity-50"
          >
            {submitting ? "Subscribing..." : "Subscribe"}
          </button>
        </form>
        {error && <p className="mt-2 text-xs text-red-200">{error}</p>}
      </div>
    </section>
  );
}