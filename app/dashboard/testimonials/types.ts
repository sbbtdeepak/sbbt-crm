export interface Testimonial {
  id: string;
  client_name: string;
  project_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
  created_at: string;
}

export interface TestimonialFormData {
  client_name: string;
  project_name: string;
  content: string;
  rating: number;
  is_featured: boolean;
}