"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/shared/PageHero";
import CTA from "@/components/home/CTA";

const categories = [
  {
    name: "Construction Manager",
    icon: "🏗️",
    description: "Lead and manage construction projects from planning to handover. Ensure quality, timelines, and team coordination.",
  },
  {
    name: "Site Engineer",
    icon: "🔧",
    description: "Supervise on-site activities, monitor structural integrity, and coordinate with contractors and vendors.",
  },
  {
    name: "Interior Designer",
    icon: "🎨",
    description: "Design modern, functional interior spaces that align with client vision and SBBT quality standards.",
  },
  {
    name: "Architect",
    icon: "📐",
    description: "Create innovative building designs, floor plans, and elevations for residential and commercial projects.",
  },
  {
    name: "Civil Engineer",
    icon: "🏛️",
    description: "Work on structural design, material estimation, and project feasibility studies for new builds.",
  },
  {
    name: "Business Development",
    icon: "📈",
    description: "Drive sales, manage client relationships, and expand SBBT's presence in Delhi NCR and beyond.",
  },
];

export default function JoinUsPage() {
  return (
    <>
      <Header />
      <PageHero title="Join Our Team" subtitle="Build your career with SBBT. Explore exciting opportunities in construction, design, and project management." />

      {/* Choose Your Category */}
      <section className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-lg font-bold text-slate-900 text-center mb-6">
            Choose Your Category
          </h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <div
                key={category.name}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="text-xl mb-2">{category.icon}</div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-slate-600 mb-2 text-xs">
                  {category.description}
                </p>
                <div className="flex flex-row gap-1">
                  <button className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-medium text-indigo-600 hover:bg-indigo-100 transition flex-1">
                    Learn More
                  </button>
                  <button className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-medium text-white hover:bg-emerald-500 transition flex-1">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Enquiry Form */}
      <section className="bg-slate-50 py-8">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Have Questions?
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Fill out the form below and we will get back to you shortly.
            </p>
          </div>

          <form className="rounded-xl bg-white p-5 shadow-md border border-slate-200 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Your email"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent">
                <option>Select category</option>
                {categories.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Message
              </label>
              <textarea
                rows={3}
                placeholder="Your message"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-emerald-500 transition text-xs"
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