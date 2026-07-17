"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CTA from "@/components/home/CTA";

const categories = [
  {
    name: "Channel Partner",
    description: "Partner with us to offer SBBT construction services to your network and earn commissions.",
    icon: "🤝",
  },
  {
    name: "Contractor",
    description: "Join our network of verified contractors for ongoing construction projects.",
    icon: "🏗️",
  },
  {
    name: "Vendor",
    description: "Supply materials and services to SBBT projects with timely payments.",
    icon: "📦",
  },
  {
    name: "Architect",
    description: "Collaborate with our design team to create exceptional living spaces.",
    icon: "🏛️",
  },
  {
    name: "Engineer",
    description: "Join our engineering team for structural and project planning.",
    icon: "📐",
  },
  {
    name: "Employee",
    description: "Build your career with SBBT. Check out our current openings.",
    icon: "👥",
  },
];

export default function JoinUsPage() {
  return (
    <>
      <Header />

      {/* Hero */}
      <section className="pt-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-950 sm:text-5xl">
              Join <span className="text-indigo-600">Us</span>
            </h1>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Become part of the SBBT family. Choose your path and grow with us.
            </p>
          </div>
        </div>
      </section>

      {/* Choose Your Category */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Choose Your Category
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-slate-600 mb-4 text-sm leading-relaxed">
                  {category.description}
                </p>
                <div className="flex gap-2">
                  <button className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100 transition">
                    Learn More
                  </button>
                  <button className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Enquiry Form */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">
              Have Questions?
            </h2>
            <p className="mt-3 text-slate-600">
              Fill out the form below and we will get back to you shortly.
            </p>
          </div>

          <form className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Category
              </label>
              <select className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                <option>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                placeholder="Your message"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-6 py-4 font-semibold text-white shadow-lg hover:bg-emerald-500 transition"
            >
              Send Enquiry
            </button>
          </form>
        </div>
      </section>

      <CTA />

      <Footer />
    </>
  );
}