#!/usr/bin/env node
/**
 * Sprint 35 - Brands Module Production Finalization
 * Fixes applied individually.
 */
const fs = require('fs');
const path = require('path');
const BASE = process.cwd();

function w(relPath, content) {
  const full = path.join(BASE, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, 'utf8');
  console.log('  OK ' + relPath);
}

// 1. BrandsSection.tsx
console.log('\n[1] BrandsSection.tsx');
w('app/dashboard/cms/components/BrandsSection.tsx', [
  '"use client";',
  '',
  'import { useState, useCallback } from "react";',
  'import BrandsList from "./BrandsList";',
  'import BrandsForm from "./BrandsForm";',
  'import type { CMSBrandRow } from "../types";',
  '',
  'export default function BrandsSection() {',
  '  const [editingBrand, setEditingBrand] = useState<CMSBrandRow | null>(null);',
  '  const [showForm, setShowForm] = useState(false);',
  '  const [refreshTrigger, setRefreshTrigger] = useState(0);',
  '',
  '  const handleEdit = useCallback((brand: CMSBrandRow) => {',
  '    setEditingBrand(brand);',
  '    setShowForm(true);',
  '  }, []);',
  '',
  '  const handleCreate = useCallback(() => {',
  '    setEditingBrand(null);',
  '    setShowForm(true);',
  '  }, []);',
  '',
  '  const handleClose = useCallback(() => {',
  '    setShowForm(false);',
  '    setEditingBrand(null);',
  '  }, []);',
  '',
  '  const handleSuccess = useCallback(() => {',
  '    setShowForm(false);',
  '    setEditingBrand(null);',
  '    setRefreshTrigger((t) => t + 1);',
  '  }, []);',
  '',
  '  return (',
  '    <div className="space-y-6">',
  '      {showForm ? (',
  '        <BrandsForm brand={editingBrand} onClose={handleClose} onSuccess={handleSuccess} />',
  '      ) : (',
  '        <BrandsList onEdit={handleEdit} onCreate={handleCreate} refreshTrigger={refreshTrigger} />',
  '      )}',
  '    </div>',
  '  );',
  '}',
  ''
].join('\n'));

// 2. image-utils.ts fix PathParts bug
console.log('\n[2] image-utils.ts - PathParts fix');
const iuPath = path.join(BASE, 'lib/brands/image-utils.ts');
let iu = fs.readFileSync(iuPath, 'utf8');
iu = iu.replace('PathParts[1]', 'pathParts[1]');
fs.writeFileSync(iuPath, iu, 'utf8');
console.log('  OK pathParts typo fixed');

// 3. Fix BrandsList.tsx imports
console.log('\n[3] BrandsList.tsx - import paths');
const blPath = path.join(BASE, 'app/dashboard/cms/components/BrandsList.tsx');
let bl = fs.readFileSync(blPath, 'utf8');
bl = bl.replace('from "./actions"', 'from "../actions"');
bl = bl.replace('from "./types"', 'from "../types"');
if (bl.includes('[.new Set(')) bl = bl.replace('[.new Set(', '[...new Set(');
if (bl.includes('[.brands]')) bl = bl.replace('[.brands]', '[...brands]');
fs.writeFileSync(blPath, bl, 'utf8');
console.log('  OK imports and syntax fixed');

// 4. actions.ts - deleteBrand storage + duplicateBrand
console.log('\n[4] actions.ts');
const aPath = path.join(BASE, 'app/dashboard/cms/actions.ts');
let a = fs.readFileSync(aPath, 'utf8');

// 4a. Fix deleteBrand
// Check if it already has storage cleanup
if (a.includes("// Fetch brand first to get logo_url for storage cleanup") || a.includes("// Fetch brand to get logo_url")) {
  console.log('  SKIP deleteBrand - already has storage cleanup');
} else {
  // Replace deleteBrand
  const oldDel = a.indexOf('export async function deleteBrand');
  const endDel = a.indexOf('}', oldDel) + 1;
  // Find closing brace of function (after revalidatePath and return)
  // Simpler: find the next export async function or end-of-file
  const nextExport = a.indexOf('\nexport async function', endDel);
  const fnEnd = nextExport > -1 ? nextExport : a.length;
  const oldFn = a.substring(oldDel, fnEnd);
  
  const newFn = `export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const brandId = formData.get('id') as string;

  if (!brandId) {
    return { success: false, message: 'No brand ID provided.' };
  }

  // Fetch brand to get logo_url for storage cleanup
  const { data: brand } = await supabase
    .from('cms_brands')
    .select('logo_url')
    .eq('id', parseInt(brandId))
    .single();

  const { error } = await supabase
    .from('cms_brands')
    .delete()
    .eq('id', parseInt(brandId));

  if (error) {
    console.error('Error deleting brand:', error);
    return { success: false, message: 'Failed to delete brand: ' + error.message };
  }

  // Clean up logo from storage
  if (brand?.logo_url) {
    try {
      const storagePath = extractStoragePath(brand.logo_url);
      if (storagePath) {
        await supabase.storage.from('cms').remove([storagePath]);
      }
    } catch (e) {
      console.warn('Could not remove brand logo from storage:', e);
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand deleted successfully.' };
}`;
  a = a.substring(0, oldDel) + newFn + '\n' + a.substring(fnEnd);
  console.log('  OK deleteBrand storage cleanup added');
}

// 4b. Add extractStoragePath import
if (!a.includes('extractStoragePath')) {
  // Add after last import
  const lastImport = a.lastIndexOf('import ');
  const afterLine = a.indexOf('\n', lastImport);
  a = a.substring(0, afterLine + 1) + 'import { extractStoragePath } from "@/lib/brands/image-utils";\n' + a.substring(afterLine + 1);
  console.log('  OK extractStoragePath import added');
}

// 4c. Add duplicateBrand
if (!a.includes('export async function duplicateBrand')) {
  const dupFn = `

export async function duplicateBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string || '';
  const category = formData.get('category') as string || '';
  const logoUrl = formData.get('logo_url') as string || '';
  const websiteUrl = formData.get('website_url') as string || '';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;
  const isActive = formData.get('is_active') === 'on';

  if (!name) {
    return { success: false, message: 'Brand name is required.' };
  }

  const { data: existing } = await supabase
    .from('cms_brands')
    .select('id')
    .eq('name', name);

  const duplicateSuffix = existing && existing.length > 0 ? ' (Copy ' + existing.length + ')' : ' (Copy)';
  const duplicateName = name + duplicateSuffix;

  const { error } = await supabase
    .from('cms_brands')
    .insert({
      site_id: '00000000-0000-0000-0000-000000000001',
      name: duplicateName,
      category,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: isActive,
    });

  if (error) {
    console.error('Error duplicating brand:', error);
    return { success: false, message: 'Failed to duplicate brand: ' + error.message };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand duplicated successfully.' };
}
`;
  // Insert before Internal Settings or at end
  const marker = '// ---- Internal Settings';
  const idx = a.indexOf(marker);
  if (idx > -1) {
    a = a.substring(0, idx) + dupFn + '\n' + a.substring(idx);
  } else {
    a += dupFn;
  }
  console.log('  OK duplicateBrand action added');
}
fs.writeFileSync(aPath, a, 'utf8');

// 5. storage-cleanup.ts
console.log('\n[5] storage-cleanup.ts');
w('lib/brands/storage-cleanup.ts', `/**
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

export async function getAllBrands(): Promise<Array<{ id: number; name: string; logo_url: string | null }>> {
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

  const basenames = new Map<string, string[]>();
  for (const file of files) {
    const base = file.replace(/\\.[^.]+$/, "").replace(/-\\d+-[a-z0-9]+$/, "");
    if (!basenames.has(base)) basenames.set(base, []);
    basenames.get(base)!.push(file);
  }
  for (const [base, fileList] of basenames) {
    if (fileList.length > 1) {
      duplicates.push(...fileList);
      entries.push({ type: "duplicate", details: 'Base name "' + base + '" has ' + fileList.length + ' variants: ' + fileList.join(", ") });
    }
  }

  return { entries, orphans, brokenUrls, duplicates };
}

export async function cleanupOrphans(dryRun: boolean = true) {
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
`);

// 6. Verify Brands.tsx
console.log('\n[6] Homepage Brands.tsx verification');
const homePaths = [
  path.join(BASE, 'Components/home/Brands.tsx'),
  path.join(BASE, 'components/home/Brands.tsx'),
];
let found = false;
for (const hp of homePaths) {
  if (fs.existsSync(hp)) {
    const c = fs.readFileSync(hp, 'utf8');
    console.log('  object-contain:  ' + (c.includes('object-contain') ? 'YES' : 'MISSING'));
    console.log('  hover:           ' + (c.includes('hover:') ? 'YES' : 'MISSING'));
    console.log('  animation:       ' + (c.includes('@keyframes') || c.includes('animate-') || c.includes('marquee') ? 'YES' : 'MISSING'));
    console.log('  responsive:      ' + (c.includes('md:') || c.includes('sm:') ? 'YES' : 'MISSING'));
    console.log('  infinite/loop:   ' + (c.includes('infinite') || c.includes('loop') ? 'YES' : 'MISSING'));
    found = true;
    break;
  }
}
if (!found) console.log('  NOT FOUND');

// 7. globals.css
console.log('\n[7] globals.css');
const cssPaths = [path.join(BASE, 'App/globals.css'), path.join(BASE, 'app/globals.css')];
found = false;
for (const gp of cssPaths) {
  if (fs.existsSync(gp)) {
    const c = fs.readFileSync(gp, 'utf8');
    console.log('  marquee/scroll/brand animation: ' + (c.includes('marquee') || c.includes('brand') || c.includes('scroll') ? 'YES' : 'MISSING'));
    found = true;
    break;
  }
}
if (!found) console.log('  NOT FOUND');

console.log('\nDone.');