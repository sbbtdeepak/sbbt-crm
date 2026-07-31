"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/* ───── Types ───── */
interface Testimonial {
  id: string;
  clientName: string;
  content: string;
  rating: number;
  projectType: string;
  location: string;
  imageUrl?: string;
}

/* ───── Star Rating ───── */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
            i < rating ? "text-amber-400" : "text-slate-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

/* ───── Single Card ───── */
function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <div
      className="flex-shrink-0 w-[280px] sm:w-[320px] lg:w-[360px] rounded-2xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm
        transition-all duration-300 hover:shadow-md"
    >
      {/* Stars */}
      <StarRating rating={t.rating} />

      {/* Quote */}
      <blockquote className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed line-clamp-4">
        &ldquo;{t.content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3 border-t border-slate-50 pt-4">
        {t.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={t.imageUrl}
            alt={t.clientName}
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover ring-2 ring-slate-100"
          />
        ) : (
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
            {t.clientName
              .split(/\s+/)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">
            {t.clientName}
          </p>
          <p className="text-xs text-slate-400 truncate">
            {t.projectType} &middot; {t.location}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ───── Scrolling Row ───── */
function Scroller({ items }: { items: Testimonial[] }) {
  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden">
      <div className="flex w-max gap-4 sm:gap-5 animate-slider-scroll">
        {doubled.map((t, i) => (
          <TestimonialCard key={`ts-${t.id}-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
}

/* ───── Section ───── */
export default function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);

  console.log("[DEBUG] Testimonials mounted");

  useEffect(() => {
    const supabase = createClient();

    console.log("[DEBUG] Querying cms_testimonials where is_featured = true");

    console.log("[DEBUG] Supabase query prepared — table: cms_testimonials, filter: is_featured=true, order: display_order ASC");

    supabase
      .from("cms_testimonials")
      .select("id, client_name, testimonial, rating, project_name, location, image_url")
      .eq("is_featured", true)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error("[DEBUG] Query FAILED - Supabase error:", error);
          return;
        }

        console.log("[DEBUG] Query success — error:", error, "| data.length:", data?.length || 0);
        if (data && data.length > 0) {
          console.log("[DEBUG] First row (raw):", JSON.stringify(data[0], null, 2));
          console.log("[DEBUG] First row keys:", Object.keys(data[0]));
        }

        if (!data || data.length === 0) {
          console.log("[DEBUG] Rows=0 - possible reasons: (a) no rows with is_featured=true in table, (b) migration 064/073 not applied, (c) RLS policy blocks read, (d) site_id mismatch");
        }

        if (data && data.length > 0) {
          const mapped = data.map((r: Record<string, unknown>) => ({
            id: String(r.id),
            clientName: (r.client_name as string) || "",
            content: (r.testimonial as string) || "",
            rating: (r.rating as number) || 5,
            projectType: (r.project_type as string) || "",
            location: (r.location as string) || "",
            imageUrl: (r.image_url as string) || undefined,
          }));
          console.log("[DEBUG] Calling setItems with mapped items count:", mapped.length);
          console.log("[DEBUG] First mapped item (after transform):", JSON.stringify(mapped[0], null, 2));
          setItems(mapped);
        } else {
          console.log("[DEBUG] setItems NOT called because data is empty or null");
        }
      });
  }, []);

  console.log("[DEBUG] Render state - items.length:", items.length);

  if (items.length === 0) {
    console.log("[DEBUG] Returning null from render because items.length === 0");
    return null;
  }

  return (
    <section className="bg-white py-12 sm:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-10">
          <p className="text-[10px] uppercase tracking-[0.32em] text-indigo-600 sm:text-xs">
            Testimonials
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 sm:text-2xl lg:text-3xl">
            What Our Clients Say
          </h2>
        </div>
      </div>

      {/* Full-width scroller */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <Scroller items={items} />
      </div>
    </section>
  );
}