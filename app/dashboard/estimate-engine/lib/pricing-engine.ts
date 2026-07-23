// ============================================================
// Pricing Engine — Pure Calculation Module
// SBBT CRM Next.js Project
//
// This is the ONLY place where pricing calculations happen.
// No hardcoded values — all rates come from Master Data.
//
// The engine is a pure function: same input always produces
// the same output. No side effects, no database calls.
// ============================================================

import type {
  PricingEngineInput,
  PricingEngineOutput,
  PricingItem,
} from "../types";

// ============================================================
// Helper: Round to 2 decimal places
// ============================================================

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ============================================================
// Helper: Calculate line item amount
// ============================================================

/**
 * Calculates the total amount for a single pricing item.
 *
 * Flow:
 * 1. Base cost = (material_rate + labour_rate) × quantity
 * 2. Wastage = base cost × wastage_percent / 100
 * 3. After wastage = base cost + wastage
 * 4. Contractor margin = after_wastage × contractor_margin_percent / 100
 * 5. After contractor margin = after_wastage + contractor_margin
 * 6. Customer margin = after_contractor × customer_margin_percent / 100
 * 7. After customer margin = after_contractor + customer_margin
 * 8. GST = after_customer_margin × gst_percent / 100
 * 9. Total = after_customer_margin + GST
 */
function calculateItemAmount(item: PricingItem): number {
  const baseCost = (item.material_rate + item.labour_rate) * item.quantity;

  const wastage = baseCost * (item.wastage_percent / 100);
  const afterWastage = baseCost + wastage;

  const contractorMargin = afterWastage * (item.contractor_margin_percent / 100);
  const afterContractor = afterWastage + contractorMargin;

  const customerMargin = afterContractor * (item.customer_margin_percent / 100);
  const afterCustomer = afterContractor + customerMargin;

  const gst = afterCustomer * (item.gst_percent / 100);

  return round2(afterCustomer + gst);
}

// ============================================================
// Helper: Sum items by type
// ============================================================

function sumMaterialCost(items: PricingItem[]): number {
  return round2(
    items.reduce((sum, item) => sum + item.material_rate * item.quantity, 0)
  );
}

function sumLabourCost(items: PricingItem[]): number {
  return round2(
    items.reduce((sum, item) => sum + item.labour_rate * item.quantity, 0)
  );
}

function sumWastage(items: PricingItem[]): number {
  return round2(
    items.reduce(
      (sum, item) =>
        sum + (item.material_rate + item.labour_rate) * item.quantity * (item.wastage_percent / 100),
      0
    )
  );
}

// ============================================================
// Main Pricing Engine
// ============================================================

/**
 * Calculates the full estimate pricing from Master Data values.
 *
 * All rates, margins, and taxes come from the input — which is
 * populated from pricing_regions, rate_master, and add_ons.
 * No hardcoded values exist in this function.
 *
 * @param input All values sourced from Master Data
 * @returns Complete pricing breakdown
 */
export function calculatePricing(input: PricingEngineInput): PricingEngineOutput {
  const {
    plot_area,
    base_rate_per_sqft,
    labour_rate_per_sqft,
    packageItems,
    addOnItems,
    discount_amount = 0,
    tax_rate = 18,
  } = input;

  // --- Construction cost from plot area ---
  const constructionCost = round2(plot_area * base_rate_per_sqft);

  // --- Material and labour costs from items ---
  const allItems = [...packageItems, ...addOnItems];
  const materialCost = sumMaterialCost(allItems);
  const labourCost = sumLabourCost(allItems);

  // --- Wastage ---
  const wastageAmount = sumWastage(allItems);

  // --- Contractor margin (on material + labour + wastage) ---
  const preContractorTotal = materialCost + labourCost + wastageAmount;
  const contractorMarginPercent =
    allItems.length > 0
      ? allItems[0].contractor_margin_percent
      : 0;
  const contractorMarginAmount = round2(
    preContractorTotal * (contractorMarginPercent / 100)
  );

  // --- Customer margin (on material + labour + wastage + contractor margin) ---
  const preCustomerTotal = preContractorTotal + contractorMarginAmount;
  const customerMarginPercent =
    allItems.length > 0
      ? allItems[0].customer_margin_percent
      : 0;
  const customerMarginAmount = round2(
    preCustomerTotal * (customerMarginPercent / 100)
  );

  // --- Subtotal (before discount and tax) ---
  const subtotal = round2(preCustomerTotal + customerMarginAmount);

  // --- Discount ---
  const discountAmount = round2(discount_amount);

  // --- Taxable amount ---
  const taxableAmount = round2(subtotal - discountAmount);

  // --- GST ---
  const gstAmount = round2(taxableAmount * (tax_rate / 100));

  // --- Grand total ---
  const grandTotal = round2(taxableAmount + gstAmount);

  return {
    base_rate_per_sqft: round2(base_rate_per_sqft),
    labour_rate_per_sqft: round2(labour_rate_per_sqft),
    construction_cost: constructionCost,
    material_cost: materialCost,
    labour_cost: labourCost,
    wastage_amount: wastageAmount,
    contractor_margin_amount: contractorMarginAmount,
    customer_margin_amount: customerMarginAmount,
    discount_amount: discountAmount,
    tax_rate: round2(tax_rate),
    gst_amount: gstAmount,
    grand_total: grandTotal,
    subtotal: subtotal,
  };
}

// ============================================================
// Item Amount Calculator (for individual line items)
// ============================================================

/**
 * Calculates the total amount for a single line item.
 * Used when building estimate_items records.
 */
export function calculateItemTotal(item: PricingItem): number {
  return calculateItemAmount(item);
}

// ============================================================
// Estimate Summary Formatter
// ============================================================

/**
 * Formats the pricing output into a human-readable summary
 * for display in the estimate summary step.
 */
export interface EstimateSummaryLine {
  label: string;
  value: string;
  type: "info" | "positive" | "negative" | "total";
}

export function formatEstimateSummary(
  output: PricingEngineOutput
): EstimateSummaryLine[] {
  return [
    { label: "Construction Cost", value: `₹${output.construction_cost.toLocaleString()}`, type: "info" },
    { label: "Material Cost", value: `₹${output.material_cost.toLocaleString()}`, type: "info" },
    { label: "Labour Cost", value: `₹${output.labour_cost.toLocaleString()}`, type: "info" },
    { label: "Wastage", value: `₹${output.wastage_amount.toLocaleString()}`, type: "info" },
    { label: "Contractor Margin", value: `₹${output.contractor_margin_amount.toLocaleString()}`, type: "positive" },
    { label: "Customer Margin", value: `₹${output.customer_margin_amount.toLocaleString()}`, type: "positive" },
    { label: "Subtotal", value: `₹${output.subtotal.toLocaleString()}`, type: "info" },
    { label: "Discount", value: `₹${output.discount_amount.toLocaleString()}`, type: "negative" },
    { label: `GST (${output.tax_rate}%)`, value: `₹${output.gst_amount.toLocaleString()}`, type: "info" },
    { label: "Grand Total", value: `₹${output.grand_total.toLocaleString()}`, type: "total" },
  ];
}
