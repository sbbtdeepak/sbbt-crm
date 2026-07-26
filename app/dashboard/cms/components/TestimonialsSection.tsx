"use client";

import { useState, useCallback } from "react";
import TestimonialsList from "./TestimonialsList";
import TestimonialsForm from "./TestimonialsForm";
import type { CMSTestimonialRow } from "../types";

type View = "list" | "create" | "edit";

export default function TestimonialsSection() {
  const [view, setView] = useState<View>("list");
  const [editingTestimonial, setEditingTestimonial] = useState<CMSTestimonialRow | null>(null);

  const handleCreate = useCallback(() => {
    setEditingTestimonial(null);
    setView("create");
  }, []);

  const handleEdit = useCallback((testimonial: CMSTestimonialRow) => {
    setEditingTestimonial(testimonial);
    setView("edit");
  }, []);

  const handleBack = useCallback(() => {
    setEditingTestimonial(null);
    setView("list");
  }, []);

  if (view === "create") {
    return <TestimonialsForm testimonial={null} onBack={handleBack} />;
  }

  if (view === "edit" && editingTestimonial) {
    return <TestimonialsForm testimonial={editingTestimonial} onBack={handleBack} />;
  }

  return <TestimonialsList onEdit={handleEdit} onCreate={handleCreate} />;
}