export interface Package {
  id?: string;
  name: string;
  price: number;
  short_description: string;
  description: string;
  brands: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PackageFormData {
  name: string;
  price: number;
  short_description: string;
  description: string;
  brands: string;
  is_active: boolean;
}

export interface PackageFeature {
  id?: string;
  section: string;
  feature: string;
  solidStructure: string;
  essential: string;
  premium: string;
  custom: string;
}