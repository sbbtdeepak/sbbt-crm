"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import LeadPopupForm from "@/components/shared/LeadPopupForm";
import { getCompanyPublicData } from "@/app/dashboard/cms/actions";

interface LeadFormState {
  name: string;
  contact: string;
  location: string;
  budget: string;
}

export default function Hero() {
  const [hero, setHero] = useState({
    title: "Build Your Dream Home with Expert Craftsmanship",
    subtitle: "Premium construction, turnkey delivery, and full-site supervision for modern homes across Delhi NCR.",
    cta_text: "Get Your Free Quote",
    cta_link: "/quote",
    image_url: "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200",
    stats: [] as Array<{ label: string; value: string }>,
  });
  const [companyData, setCompanyData] = useState({
    google_rating: 0,
    years_experience: 0,
    homes_delivered: 0,
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupShown, setPopupShown] = useState(false);
  const [leadForm, setLeadForm] = useState<LeadFormState>({
    name: "",
    contact: "",
    location: "",
    budget: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    // Fetch company metrics
    getCompanyPublicData().then(data => {
      setCompanyData({
        google_rating: data.google_rating,
        years_experience: data.years_experience,
        homes_delivered: data.homes_delivered,
      });
    }).catch(() => {});

    const supabase = createClient();

    // Fetch CMS Homepage data
    supabase
      .from("cms_homepage")
      .select("*")
      .eq("site_id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle()
      .then(({ data: cmsHomepage }) => {
        // Fetch hero banner as fallback
        supabase
          .from("hero_banner")
          .select("*")
          .eq("is_active", true)
          .maybeSingle()
          .then(({ data: heroBanner }) => {
            setHero({
              title: cmsHomepage?.hero_heading || heroBanner?.title || "Build Your Dream Home with Expert Craftsmanship",
              subtitle: cmsHomepage?.hero_subheading || heroBanner?.subtitle || "Premium construction, turnkey delivery, and full-site supervision for modern homes across Delhi NCR.",
              cta_text: cmsHomepage?.hero_cta_text || heroBanner?.button_text || "Get Your Free Quote",
              cta_link: cmsHomepage?.hero_cta_link || heroBanner?.button_link || "/quote",
              image_url: cmsHomepage?.hero_background_url || heroBanner?.image_url || "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200",
              stats: cmsHomepage?.stats || [],
            });
          });
      });

  }, []);

  // Show popup after 10 seconds
  useEffect(() => {
    if (popupShown) return;

    const timer = setTimeout(() => {
      setIsPopupOpen(true);
      setPopupShown(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [popupShown]);

  const handleLeadFormChange = (field: keyof LeadFormState, value: string) => {
    setLeadForm(prev => ({ ...prev, [field]: value }));
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...leadForm,
          source: "hero_popup",
          current_page: "/",
        }),
      });

      if (response.ok) {
        setSubmitMessage("Quote request submitted successfully! We'll contact you soon.");
        setLeadForm({ name: "", contact: "", location: "", budget: "" });
        setTimeout(() => setIsPopupOpen(false), 2000);
      } else {
        setSubmitMessage("Failed to submit. Please try again.");
      }
    } catch {
      setSubmitMessage("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const image = hero.image_url?.startsWith("http")
    ? hero.image_url
    : "https://images.pexels.com/photos/5843998/pexels-photo-5843998.jpeg?auto=compress&cs=tinysrgb&w=1200";

  return (
    <>
      {/* ============================================ */}
      {/* DESKTOP HERO - Premium Asymmetrical Layout   */}
      {/* ============================================ */}
      <section className="hidden md:block bg-white relative overflow-hidden" aria-label="Hero banner">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-white to-emerald-50/30 pointer-events-none" />
        
        {/* Main content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-[80px] pt-20 pb-0">
          <div className="grid lg:grid-cols-[25fr_75fr] gap-8 xl:gap-12 items-center min-h-[600px]">
            
            {/* LEFT CONTENT - 35% */}
            <div className="relative z-10 pb-8">
              {/* Trust Pill */}
              <span className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1.5 text-[10px] font-semibold text-indigo-700 ring-1 ring-indigo-100 sm:text-xs sm:px-4 sm:py-1.5">
                ✦ Luxury Residential Construction
              </span>

              {/* Heading */}
              <h1 className="mt-4 sm:mt-6 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl xl:text-5xl leading-[1.1]">
                {hero.title}
              </h1>

              {/* Subheading */}
              {hero.subtitle && (
                <p className="mt-3 sm:mt-4 max-w-xl text-sm text-slate-600 sm:text-base lg:text-lg leading-relaxed">
                  {hero.subtitle}
                </p>
              )}

              {/* Trust Badges - Dynamically from Company CMS */}
              <div className="mt-6 flex flex-wrap items-center gap-4">
                {(companyData.google_rating > 0) && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                    <span className="text-emerald-600 text-xs">{'★'.repeat(Math.round(companyData.google_rating))}</span>
                    <span className="text-[11px] font-semibold text-emerald-700">{companyData.google_rating} Google Rating</span>
                  </div>
                )}
                {(companyData.years_experience > 0) && (
                  <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                    <span className="text-[11px] font-semibold text-blue-700">{companyData.years_experience}+ Years Experience</span>
                  </div>
                )}
                {(companyData.homes_delivered > 0) && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5">
                    <span className="text-[11px] font-semibold text-emerald-700">{companyData.homes_delivered.toLocaleString()} Homes Built</span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={hero.cta_link || "/quote"}
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                  aria-label={hero.cta_text || "Get Free Quote"}
                >
                  {hero.cta_text || "Get Your Free Quote"}
                </Link>

                <Link
                  href="/packages"
                  className="inline-flex w-full sm:w-auto items-center justify-center rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  View Packages →
                </Link>
              </div>
            </div>

            {/* RIGHT HERO IMAGE - 75% (increased ~15% from 65%) */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-slate-200/80">
                <Image
                  src={image}
                  alt="Luxury home construction"
                  className="w-full h-full object-cover"
                  width={1200}
                  height={650}
                  priority
                  style={{ minHeight: "500px", maxHeight: "650px", width: "100%", height: "auto" }}
                />
                {/* Gradient overlay for text blending */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Floating Quote Form Below Hero */}
          <div className="relative -mt-14 pb-12 z-20">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleLeadSubmit} className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-slate-200/80 shadow-2xl shadow-slate-900/10 p-6 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={leadForm.name}
                      onChange={(e) => handleLeadFormChange("name", e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={leadForm.contact}
                      onChange={(e) => handleLeadFormChange("contact", e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Plot Location</label>
                    <input
                      type="text"
                      placeholder="Delhi / NCR"
                      value={leadForm.location}
                      onChange={(e) => handleLeadFormChange("location", e.target.value)}
                      required
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Budget (₹)</label>
                    <input
                      type="text"
                      placeholder="Approx. budget"
                      value={leadForm.budget}
                      onChange={(e) => handleLeadFormChange("budget", e.target.value)}
                      className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? "Submitting..." : "GET QUOTE NOW"}
                    </button>
                  </div>
                </div>
                {submitMessage && (
                  <p className="mt-3 text-xs text-center text-slate-600 bg-slate-50 rounded-xl py-2">{submitMessage}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* MOBILE HERO - Premium Compact Layout         */}
      {/* ============================================ */}
      <section className="md:hidden bg-white relative pt-0.5" aria-label="Hero banner">
        {/* Hero Image - 16:9 */}
        <div className="px-3">
          <div className="aspect-[16/9] overflow-hidden rounded-2xl shadow-xl shadow-slate-200/60">
            <Image
              src={image}
              alt="Luxury home construction"
              className="w-full h-full object-cover"
              width={800}
              height={450}
              priority
            />
          </div>
        </div>

        {/* Hero Text - Immediately below image */}
        <div className="px-4 pt-4 pb-6 space-y-3">
          <h1 className="text-lg font-bold tracking-tight text-slate-950 leading-snug">
            {hero.title}
          </h1>

          {hero.subtitle && (
            <p className="text-xs text-slate-600 leading-relaxed">
              {hero.subtitle}
            </p>
          )}

          {/* Trust Badges Row - Dynamically from Company CMS */}
          <div className="flex flex-wrap gap-1.5">
            {(companyData.google_rating > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                <span className="text-emerald-600 text-xs">{'★'.repeat(Math.round(companyData.google_rating))}</span>
                <span className="text-[10px] font-semibold text-emerald-700">{companyData.google_rating} Google Rating</span>
              </span>
            )}
            {(companyData.years_experience > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1">
                <span className="text-[10px] font-semibold text-blue-700">{companyData.years_experience}+ Years</span>
              </span>
            )}
            {(companyData.homes_delivered > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1">
                <span className="text-[10px] font-semibold text-emerald-700">{companyData.homes_delivered.toLocaleString()} Homes</span>
              </span>
            )}
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => setIsPopupOpen(true)}
            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:scale-[1.02] active:scale-95"
            aria-label="Get Quote Now"
          >
            GET QUOTE NOW
          </button>

          {/* Secondary CTA */}
          <Link
            href="/packages"
            className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-indigo-300 hover:bg-slate-50"
          >
            View Our Packages →
          </Link>
        </div>
      </section>

      {/* Lead Popup Form */}
      <LeadPopupForm
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        leadForm={leadForm}
        onFormChange={handleLeadFormChange}
        onSubmit={handleLeadSubmit}
        isSubmitting={isSubmitting}
        submitMessage={submitMessage}
      />
    </>
  );
}