import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import Brands from "@/components/home/Brands";
import Link from "next/link";

export const metadata = {
  title: "About Us | Shree Badree Build Tech Pvt Ltd",
  description: "Learn about Shree Badree Build Tech Pvt Ltd, our journey since 2011, mission, vision and premium residential construction services in Delhi NCR.",
};

export default function AboutPage() {
  return (
    <>
      <Header />

      {/* Section 1: Hero */}
      <section className="pt-24 bg-gradient-to-br from-slate-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl lg:text-4xl">
              Building Dreams Since 2011
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
              Shree Badree Build Tech Pvt Ltd has been delivering premium residential and commercial construction with transparency, quality and timely execution.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/quote"
                className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-md hover:bg-emerald-500 transition text-xs"
              >
                Let's Build
              </a>
<Link
                href="/projects"
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-50 transition text-xs"
              >
                View Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Company Story */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-indigo-200 hidden md:block" />
            
            <div className="space-y-12 md:space-y-16">
              {/* 2011 */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="md:w-1/2 text-center md:text-right">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-sm font-bold text-white">
                    2011
                  </div>
                </div>
                <div className="md:w-1/2 rounded-xl bg-slate-50 p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Started Construction Journey</h3>
                  <p className="text-xs text-slate-600">
                    Our founder began his construction journey with a small team and big dreams, focusing on quality homes.
                  </p>
                </div>
              </div>

              {/* 2022 */}
              <div className="flex flex-col md:flex-row-reverse items-center gap-4">
                <div className="md:w-1/2 text-center md:text-left">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-600 text-sm font-bold text-white">
                    2022
                  </div>
                </div>
                <div className="md:w-1/2 rounded-xl bg-slate-50 p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Incorporated as Shree Badree Build Tech Pvt Ltd</h3>
                  <p className="text-xs text-slate-600">
                    Formal incorporation with a vision to revolutionize residential construction with transparent pricing and quality materials.
                  </p>
                </div>
              </div>

              {/* Today */}
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="md:w-1/2 text-center md:text-right">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-indigo-600 text-sm font-bold text-white">
                    Today
                  </div>
                </div>
                <div className="md:w-1/2 rounded-xl bg-slate-50 p-5">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Serving Delhi NCR</h3>
                  <p className="text-xs text-slate-600">
                    A trusted premium residential construction company serving hundreds of happy families across Delhi NCR.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Vision */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl bg-white p-8 shadow-md text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Our Vision</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              To become India's most trusted and transparent construction partner, empowering families to build their dream homes with confidence and clarity.
            </p>
          </div>
        </div>
      </section>

      {/* Section 4: Mission */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl bg-slate-50 p-8 shadow-md text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-3">Our Mission</h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Delivering high-quality residential construction through transparent processes, premium materials, and timely execution.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Core Values */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">Core Values</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Transparency", icon: "🔍" },
              { title: "Quality", icon: "⭐" },
              { title: "Trust", icon: "🤝" },
              { title: "Innovation", icon: "💡" },
              { title: "Customer Satisfaction", icon: "😊" },
              { title: "On-Time Delivery", icon: "⏱️" },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl bg-white p-5 text-center shadow-sm hover:shadow-md transition"
              >
                <div className="text-2xl mb-2">{value.icon}</div>
                <h3 className="text-sm font-bold text-slate-900">{value.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Why Choose SBBT */}
      <WhyChooseUs />

      {/* Section 7: Our Construction Process */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-xl font-bold text-slate-900 text-center mb-8">Our Construction Process</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { number: "01", title: "Consultation", description: "Initial meeting to understand your requirements and site conditions." },
              { number: "02", title: "Planning", description: "Detailed project planning with timeline and material selection." },
              { number: "03", title: "Design", description: "Architectural and structural design with your approval." },
              { number: "04", title: "Construction", description: "Quality construction with daily monitoring and updates." },
              { number: "05", title: "Quality Check", description: "Comprehensive quality checks at every milestone." },
              { number: "06", title: "Handover", description: "Final handover with warranty and support documentation." },
            ].map((step) => (
              <div key={step.number} className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{step.title}</h3>
                <p className="mt-1.5 text-xs text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Company Statistics */}
      <section className="bg-indigo-600 py-12 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-xl font-bold text-center mb-8">By the Numbers</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { stat: "500+", label: "Projects Completed" },
              { stat: "300+", label: "Happy Families" },
              { stat: "13+", label: "Years Experience" },
              { stat: "50+", label: "Engineers" },
              { stat: "5+", label: "Cities Served" },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-2xl font-bold mb-1">{item.stat}</div>
                <p className="text-indigo-200 text-[10px]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 9: Brands */}
      <Brands />

      {/* Section 10: CTA */}
      <section className="bg-white py-12">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            Let's Build Your Dream Home
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/quote"
              className="rounded-full bg-emerald-600 px-5 py-2.5 font-semibold text-white shadow-md hover:bg-emerald-500 transition text-xs"
            >
              Get Free Quote
            </a>
            <a
              href="/contact"
              className="rounded-full border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-900 hover:bg-slate-50 transition text-xs"
            >
              Contact Engineer
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}