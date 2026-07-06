export type ProjectStatus = "planning" | "ongoing" | "completed";

export type ProjectPackage =
  | "Essential"
  | "Solid Structure"
  | "Premium Luxury"
  | "Custom";

export interface ProjectImage {
  id: string;
  project_id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
  created_at?: string;
}

export interface Project {
  id: string;
  name: string;
  client_name: string;
  cid: string | null;
  package: ProjectPackage | null;
  project_value: number | null;
  plot_area: string | null;
  road_facing: string | null;
  floors: number | null;
  status: ProjectStatus;
  rating: number | null;
  location: string | null;
  features: string[] | null;
  timeline: string | null;
  created_at?: string;
  updated_at?: string;
  project_images?: ProjectImage[];
  thumbnail_url?: string | null;
}

export type ProjectInput = Omit<
  Project,
  "id" | "created_at" | "updated_at" | "project_images" | "thumbnail_url"
>;

export const PROJECT_STATUSES: ProjectStatus[] = [
  "planning",
  "ongoing",
  "completed",
];

export const PROJECT_PACKAGES: ProjectPackage[] = [
  "Essential",
  "Solid Structure",
  "Premium Luxury",
  "Custom",
];

export function getProjectThumbnail(project: Project): string | null {
  if (project.thumbnail_url) {
    return project.thumbnail_url;
  }

  const images = [...(project.project_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  );

  return images[0]?.image_url ?? null;
}
