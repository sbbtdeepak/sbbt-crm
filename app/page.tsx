import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import Packages from "@/components/home/Packages";
import Projects from "@/components/home/Projects";
import GoogleReviews from "@/components/home/GoogleReviews";
import Testimonials from "@/components/home/Testimonials";
import Blogs from "@/components/home/Blogs";
import CTA from "@/components/home/CTA";
import ConstructionEstimator from "@/components/home/ConstructionEstimator";
import Brands from "@/components/home/Brands";
import ReferEarn from "@/components/home/ReferEarn";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import FAQ from "@/components/home/FAQ";

export default function HomePage() {
  return (
    <>
      <Header />

      <Hero />

      <Packages />

      <ConstructionEstimator />

      {/* Compare Packages CTA */}
      <section className="bg-white py-24 text-slate-900">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-6">
          <p className="text-sm uppercase tracking-[0.32em] text-indigo-600">
            Comparison
          </p>
          <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Compare Construction Packages
          </h2>
          <p className="text-lg leading-8 text-slate-600">
            Compare all construction packages side-by-side before choosing the
            best option.
          </p>
          <a
            href="/packages"
            className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-10 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
          >
            Compare Packages
          </a>
        </div>
      </section>

      <Projects />

      <GoogleReviews />

      <WhyChooseUs />

      <Brands />

      <ReferEarn />

      <Testimonials />

      <FAQ />

      <Blogs />

      <CTA />

      <Footer />
    </>
  );
}