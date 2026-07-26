"use client";

import { useState, useEffect } from "react";
import { getTestimonials, deleteTestimonial, toggleTestimonialFeatured } from "../actions";
import type { CMSTestimonialRow } from "../types";

interface Props {
  onEdit: (testimonial: CMSTestimonialRow) => void;
  onCreate: () => void;
}

export default function TestimonialsList({ onEdit, onCreate }: Props) {
  const [testimonials, setTestimonials] = useState<CMSTestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchTestimonials() {
      try {
        setLoading(true);
        setError(null);
        const data = await getTestimonials();
        if (!cancelled) {
          setTestimonials(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load testimonials");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    fetchTestimonials();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    const formData = new FormData();
    formData.set("id", String(id));
    const result = await deleteTestimonial({ success: false, message: "" }, formData);
    if (result.success) {
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleToggleFeatured = async (id: number, current: boolean) => {
    const formData = new FormData();
    formData.set("id", String(id));
    formData.set("is_featured", current ? "off" : "on");
    await toggleTestimonialFeatured({ success: false, message: "" }, formData);
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, is_featured: !current } : t))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-md bg-red-50 text-red-800 border border-red-200" role="alert">
        Error: {error}
      </div>
    );
  }

  const renderStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Testimonials</h2>
        <button
          onClick={onCreate}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          + New Testimonial
        </button>
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No testimonials yet</p>
          <p className="mt-1">Create your first testimonial to get started.</p>
        </div>
      )}

      <div className="space-y-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.id}
            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold truncate">{testimonial.client_name}</h3>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${
                      testimonial.is_featured
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {testimonial.is_featured ? "Featured" : "Standard"}
                  </span>
                  <span className="text-amber-500 text-sm">{renderStars(testimonial.rating)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{testimonial.testimonial}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  {testimonial.designation && <span>{testimonial.designation}</span>}
                  {testimonial.location && <span>{testimonial.location}</span>}
                  <span>Order: {testimonial.display_order}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFeatured(testimonial.id, testimonial.is_featured);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    testimonial.is_featured
                      ? "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  }`}
                >
                  {testimonial.is_featured ? "Unfeature" : "Feature"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(testimonial);
                  }}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition"
                >
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(testimonial.id);
                  }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}