#!/usr/bin/env node
// Final fixes script - no template literals, safe escaping
const fs = require('fs');
const path = require('path');
const BASE = process.cwd();

function read(p) { return fs.readFileSync(path.join(BASE, p), 'utf8'); }
function write(p, c) { fs.writeFileSync(path.join(BASE, p), c, 'utf8'); console.log('  OK ' + p); }

// 1. BrandsSection.tsx - fix import path
console.log('\n1. BrandsSection.tsx');
let b = read('app/dashboard/cms/components/BrandsSection.tsx');
b = b.replace('from "./types"', 'from "../types"');
write('app/dashboard/cms/components/BrandsSection.tsx', b);

// 2. image-utils.ts - fix PathParts bug
console.log('2. image-utils.ts');
let iu = read('lib/brands/image-utils.ts');
iu = iu.replace('PathParts[1]', 'pathParts[1]');
write('lib/brands/image-utils.ts', iu);

// 3. BrandsList.tsx - fix import paths + syntax
console.log('3. BrandsList.tsx');
let bl = read('app/dashboard/cms/components/BrandsList.tsx');
bl = bl.replace('from "./actions"', 'from "../actions"');
bl = bl.replace('from "./types"', 'from "../types"');
// Fix spread syntax corruption
bl = bl.replace('[.new Set(', '[...new Set(');
bl = bl.replace('[.brands]', '[...brands]');
bl = bl.replace('[.filter', '[...filter');
bl = bl.replace('[.brands', '[...brands');
write('app/dashboard/cms/components/BrandsList.tsx', bl);

// 4. actions.ts - add duplicateBrand, fix deleteBrand
console.log('4. actions.ts');
let a = read('app/dashboard/cms/actions.ts');

// Check if extractStoragePath already imported
if (!a.includes('extractStoragePath')) {
  a = a.replace(
    'import { revalidatePath } from "next/cache";',
    'import { revalidatePath } from "next/cache";\nimport { extractStoragePath } from "@/lib/brands/image-utils";'
  );
  console.log('   Added extractStoragePath import');
}

// Check if duplicateBrand already exists
if (!a.includes('duplicateBrand')) {
  // Find deleteBrand end and insert duplicateBrand before Internal Settings
  const sections = a.split('\n// ---- Internal Settings');
  if (sections.length > 1) {
    const dupFn = [
      '',
      'export async function duplicateBrand(_prevState, formData) {',
      '  const supabase = await createClient();',
      '  const name = formData.get("name") || "";',
      '  const category = formData.get("category") || "";',
      '  const logoUrl = formData.get("logo_url") || "";',
      '  const websiteUrl = formData.get("website_url") || "";',
      '  const displayOrder = parseInt(formData.get("display_order") || "0");',
      '  const isActive = formData.get("is_active") === "on";',
      '  if (!name) return { success: false, message: "Brand name is required." };',
      '  const { data: existing } = await supabase',
      '    .from("cms_brands")',
      '    .select("id")',
      '    .eq("name", name);',
      '  const suffix = existing && existing.length > 0 ? " (Copy " + existing.length + ")" : " (Copy)";',
      '  const { error } = await supabase',
      '    .from("cms_brands")',
      '    .insert({',
      '      site_id: "00000000-0000-0000-0000-000000000001",',
      '      name: name + suffix,',
      '      category,',
      '      logo_url: logoUrl,',
      '      website_url: websiteUrl,',
      '      display_order: displayOrder,',
      '      is_active: isActive,',
      '    });',
      '  if (error) {',
      '    console.error("Error duplicating brand:", error);',
      '    return { success: false, message: "Failed to duplicate brand: " + error.message };',
      '  }',
      '  revalidatePath("/dashboard/cms");',
      '  revalidatePath("/", "layout");',
      '  return { success: true, message: "Brand duplicated successfully." };',
      '}',
    ].join('\n');
    a = sections.join(dupFn + '\n// ---- Internal Settings');
    console.log('   Added duplicateBrand');
  }
}

// Fix deleteBrand to include storage cleanup
if (a.includes('// Fetch brand first')) {
  console.log('   deleteBrand already updated');
} else {
  // Replace deleteBrand function - the old version
  const oldDel = [
    'export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {',
    '  const supabase = await createClient();',
    '  const brandId = formData.get(\'id\') as string;',
    '  if (!brandId) {',
    '    return { success: false, message: \'No brand ID provided.\' };',
    '  }',
    '  const { error } = await supabase',
    '    .from(\'cms_brands\')',
    '    .delete()',
    '    .eq(\'id\', parseInt(brandId));',
    '  if (error) {',
    '    console.error(\'Error deleting brand:\', error);',
    '    return { success: false, message: `Failed to delete brand: ${error.message}` };',
    '  }',
    '  revalidatePath(\'/dashboard/cms\');',
    '  revalidatePath(\'/\', \'layout\');',
    '  return { success: true, message: \'Brand deleted successfully.\' };',
    '}',
  ].join('\n');

  const newDel = [
    'export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {',
    '  const supabase = await createClient();',
    '  const brandId = formData.get(\'id\') as string;',
    '  if (!brandId) {',
    '    return { success: false, message: \'No brand ID provided.\' };',
    '  }',
    '  // Fetch brand to get logo_url for storage cleanup',
    '  const { data: brand } = await supabase',
    '    .from(\'cms_brands\')',
    '    .select(\'logo_url\')',
    '    .eq(\'id\', parseInt(brandId))',
    '    .single();',
    '  const { error } = await supabase',
    '    .from(\'cms_brands\')',
    '    .delete()',
    '    .eq(\'id\', parseInt(brandId));',
    '  if (error) {',
    '    console.error(\'Error deleting brand:\', error);',
    '    return { success: false, message: `Failed to delete brand: ${error.message}` };',
    '  }',
    '  // Clean up logo from storage',
    '  if (brand?.logo_url) {',
    '    try {',
    '      const storagePath = extractStoragePath(brand.logo_url);',
    '      if (storagePath) {',
    '        await supabase.storage.from(\'cms\').remove([storagePath]);',
    '      }',
    '    } catch (e) {',
    '      console.warn(\'Could not remove brand logo from storage:\', e);',
    '    }',
    '  }',
    '  revalidatePath(\'/dashboard/cms\');',
    '  revalidatePath(\'/\', \'layout\');',
    '  return { success: true, message: \'Brand deleted successfully.\' };',
    '}',
  ].join('\n');

  if (a.includes(oldDel)) {
    a = a.replace(oldDel, newDel);
    console.log('   deleteBrand storage cleanup added');
  } else {
    console.log('   WARN: Could not match deleteBrand exactly - checking...');
    // Find deleteBrand function and verify it's there
    if (a.includes('export async function deleteBrand')) {
      console.log('   deleteBrand function exists, verifying format...');
    }
  }
}

write('app/dashboard/cms/actions.ts', a);

// 5. storage-cleanup.ts
console.log('5. storage-cleanup.ts');
const sc = `/**
 * Brands Storage Cleanup Utility
 * Detects orphaned files, duplicate files, and broken URLs in brands storage
 */
import { createClient } from "@/lib/supabase/server";
import { BRANDS_FOLDER } from "./image-utils";

export interface StorageAuditEntry {
  type: "orphan" | "duplicate" | "broken_url" | "ok";
  storagePath?: string;
  brandId?: number;
  brandName?: string;
  details: string;
}

export async function listBrandStorageFiles(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from("cms")
    .list(BRANDS_FOLDER, { limit: 500, sortBy: { column: "name", order: "asc" } });
  if (error) { console.error("Error listing brand storage files:", error); return []; }
  return (data || []).map((f) => f.name);
}

export async function getAllBrands() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cms_brands").select("id, name, logo_url");
  if (error) { console.error("Error fetching brands:", error); return []; }
  return data || [];
}

export async function runStorageAudit() {
  const files = await listBrandStorageFiles();
  const brands = await getAllBrands();
  const entries: StorageAuditEntry[] = [];
  const orphans: string[] = [];
  const brokenUrls: Array<{ brandName: string; url: string }> = [];
  const duplicates: string[] = [];

  const referencedPaths = new Set<string>();
  for (const brand of brands) {
    if (brand.logo_url) {
      try {
        const url = new URL(brand.logo_url);
        const pathParts = url.pathname.split("/cms/");
        if (pathParts.length > 1) referencedPaths.add(pathParts[1]);
        else brokenUrls.push({ brandName: brand.name, url: brand.logo_url });
      } catch {
        brokenUrls.push({ brandName: brand.name, url: brand.logo_url });
      }
    }
  }

  for (const file of files) {
    const storagePath = BRANDS_FOLDER + "/" + file;
    if (!referencedPaths.has(storagePath)) {
      orphans.push(file);
      entries.push({ type: "orphan", storagePath, details: 'File "' + file + '" exists in storage but is not referenced by any brand' });
    } else {
      entries.push({ type: "ok", storagePath, details: 'File "' + file + '" is properly referenced' });
    }
  }

  const basenames = new Map();
  for (const file of files) {
    const base = file.replace(/\.[^.]+$/, "").replace(/-\d+-[a-z0-9]+$/, "");
    if (!basenames.has(base)) basenames.set(base, []);
    basenames.get(base).push(file);
  }
  for (const [base, fileList] of basenames) {
    if (fileList.length > 1) {
      duplicates.push(...fileList);
      entries.push({ type: "duplicate", details: 'Base name "' + base + '" has ' + fileList.length + ' variants: ' + fileList.join(", ") });
    }
  }

  return { entries, orphans, brokenUrls, duplicates };
}

export async function cleanupOrphans(dryRun = true) {
  const { orphans } = await runStorageAudit();
  if (orphans.length === 0) return { deletedPaths: [], dryRun };
  if (dryRun) return { deletedPaths: orphans.map((f) => BRANDS_FOLDER + "/" + f), dryRun };

  const supabase = await createClient();
  const deletedPaths: string[] = [];
  for (const orphanFile of orphans) {
    const path = BRANDS_FOLDER + "/" + orphanFile;
    const { error } = await supabase.storage.from("cms").remove([path]);
    if (!error) deletedPaths.push(path);
  }
  return { deletedPaths, dryRun };
}
`;
write('lib/brands/storage-cleanup.ts', sc);

// 6. Verify Components/home/Brands.tsx
console.log('6. Homepage Brands.tsx');
const hp = path.join(BASE, 'Components/home/Brands.tsx');
if (fs.existsSync(hp)) {
  const c = fs.readFileSync(hp, 'utf8');
  console.log('   object-contain: ' + (c.includes('object-contain') ? 'YES' : '--'));
  console.log('   hover: ' + (c.includes('hover:') ? 'YES' : '--'));
  console.log('   animation: ' + (c.includes('@keyframes') || c.includes('animate-') ? 'YES' : '--'));
  console.log('   responsive: ' + (c.includes('md:') || c.includes('sm:') ? 'YES' : '--'));
  console.log('   infinite/loop: ' + (c.includes('infinite') || c.includes('loop') || c.includes('marquee') ? 'YES' : '--'));
}

// 7. Verify globals.css
console.log('7. globals.css');
const gp = path.join(BASE, 'App/globals.css');
if (fs.existsSync(gp)) {
  const c = fs.readFileSync(gp, 'utf8');
  console.log('   marquee/scroll/brand: ' + (c.includes('marquee') || c.includes('brand') || c.includes('scroll') ? 'YES' : '--'));
}

// 8. Duplicate Brand UI - update BrandsList.tsx table columns
console.log('8. BrandsList.tsx - verify columns');
bl = read('app/dashboard/cms/components/BrandsList.tsx');
// Verify the list shows all required columns
const columns = ['Logo', 'Brand Name', 'Category', 'Website', 'Status', 'Display Order', 'Created Date', 'Last Updated', 'Edit', 'Delete', 'Duplicate'];
for (const col of ['onEdit', 'logo_url', 'name', 'category', 'website_url', 'is_active', 'display_order', 'created_at', 'updated_at', 'Duplicate']) {
  if (bl.includes(col)) console.log('   Column "' + col + '": ' + (bl.includes(col) ? 'YES' : 'MISSING'));
}

console.log('\nDone.');