export interface Package {
  id?: string;

  name: string;
  price: number;

  description: string;

  status: string;

  created_at?: string;
  updated_at?: string;
}

export interface PackageFormData {
  name: string;
  price: number;
  description: string;
  status: string;
}
