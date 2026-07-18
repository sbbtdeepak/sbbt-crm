import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import Packages from "@/components/home/Packages";
import PackageComparison from "@/components/home/PackageComparison";
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

      {/* Compare Packages Button - expands to show PackageComparison accordion */}
      <PackageComparison />

      <ConstructionEstimator />

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