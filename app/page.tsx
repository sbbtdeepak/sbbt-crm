import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import Packages from "@/components/home/Packages";
import Projects from "@/components/home/Projects";
import Testimonials from "@/components/home/Testimonials";
import Blogs from "@/components/home/Blogs";
import CTA from "@/components/home/CTA";

export default function HomePage() {
  return (
    <>
      <Header />

      <Hero />

      <Packages />

      <Projects />

      <Testimonials />

      <Blogs />

      <CTA />

      <Footer />
    </>
  );
}