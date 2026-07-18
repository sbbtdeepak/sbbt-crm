// Package rates are now stored in Supabase database
// This file provides utility functions for client-side rate access

export const PACKAGE_RATES: Record<string, number> = {
  Basic: 1699,
  Premium: 1899,
  Luxury: 2499,
};

export const PACKAGE_LABELS = {
  basic: "Basic",
  premium: "Premium",
  luxury: "Luxury",
  custom: "Custom Quote",
} as const;

export const PACKAGES_CONFIG = [
  { value: "basic" as const, label: "Basic", rate: 1699 },
  { value: "premium" as const, label: "Premium", rate: 1899 },
  { value: "luxury" as const, label: "Luxury", rate: 2499 },
  { value: "custom" as const, label: "Custom Quote", rate: 0 },
];

// NOTE: Actual packages should be fetched from Supabase in components
// This is kept for backwards compatibility with ConstructionEstimator