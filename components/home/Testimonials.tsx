"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Testimonial {
  id: number;
  client_name: string;
  designation: string;
  project_name: string;
  testimonial: string;
  image_url: string;
  rating: number;
  is_featured: boolean;
  display_order: number;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("cms_testimonials")
      .select("*")
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .then(({ data }) => {
        setTestimonials((data || []) as Testimonial[]);
      });
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="bg-white py-6 sm:py-10 text-slate-900" aria-label="Customer testimonials">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-4 sm:mb-6">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Customer confidence
          </p>
          <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
            What clients say about our craftsmanship.
          </h2>
          <p className="mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm">
            Featured stories from clients who trusted us with their most important construction projects.
          </p>
        </div>

        {/* Desktop Grid */}
        <div className="mt-4 hidden md:grid gap-4 md:grid-cols-2 xl:grid-cols-3 auto-cols-fr">
          {testimonials.map((item) => (
            <blockquote
              key={item.id}
              className="group rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md h-full flex flex-col"
            >
              <div className="flex items-center gap-2 text-indigo-600">
                <span className="text-lg" aria-hidden="true">&ldquo;</span>
                <p className="text-[10px] uppercase tracking-[0.24em] text-indigo-600">
                  Featured testimonial
                </p>
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-700 italic flex-1">
                &ldquo;{item.testimonial}&rdquo;
              </p>
              <footer className="mt-3 border-t border-slate-200 pt-2">
                <p className="font-semibold text-slate-950 text-xs">{item.client_name}</p>
                <p className="mt-0.5 text-[10px] text-slate-500">{item.project_name}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Mobile Swipe Carousel */}
        <div className="mt-4 md:hidden">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 hide-scrollbar">
            {testimonials.map((item) => (
              <blockquote
                key={item.id}
                className="snap-start flex-shrink-0 w-[calc(100vw-32px-60px)] max-w-sm rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 shadow-sm"
              >
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <span className="text-base" aria-hidden="true">&ldquo;</span>
                  <p className="text-[9px] uppercase tracking-[0.24em] text-indigo-600">
                    Testimonial
                  </p>
                </div>
                <p className="mt-2 text-xs leading-4 text-slate-700 italic">
                  &ldquo;{item.testimonial}&rdquo;
                </p>
                <footer className="mt-2 border-t border-slate-200 pt-1.5">
                  <p className="font-semibold text-slate-950 text-xs">{item.client_name}</p>
                  <p className="mt-0 text-[9px] text-slate-500">{item.project_name}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}