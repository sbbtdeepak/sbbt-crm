export interface Project {
  id: string;
  name: string;
  client_name: string;
  cid: string;
  package: string;
  project_value: number | null;
  plot_area: string;
  road_facing: string;
  floors: number;
  status: string;
  rating: number;
  location: string;
  features: string[];
  timeline: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectFormData {
  name: string;
  client_name: string;
  cid: string;
  package: string;
  project_value: number;
  plot_area: string;
  road_facing: string;
  floors: number;
  status: string;
  rating: number;
  location: string;
  timeline: string;
  features: string;
}