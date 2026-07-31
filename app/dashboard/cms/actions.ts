'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CMSCompanyRow,
  CMSInternalSettingsRow,
  CMSProjectFull,
  CMSPackageFull,
  CMSStat,
  CMSMediaItem,
} from './types';
import { DEFAULT_SITE_ID, CMS_STORAGE_FOLDERS, CMS_STORAGE_BUCKET } from './types';

// ============================================================
// Company (Public) Actions
// ============================================================

export async function getCompanyData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_company')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  if (error) {
    console.error('Error fetching company data:', error);
    return null;
  }

  return data as CMSCompanyRow | null;
}

export async function getSocialLinks() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("cms_social")
    .select("*")
    .eq("site_id", DEFAULT_SITE_ID)
    .maybeSingle();

  if (!data) return [];

  const links: Array<{ platform: string; url: string; label: string }> = [];

  if (data.facebook_url) links.push({ platform: "facebook", url: data.facebook_url, label: "Facebook" });
  if (data.instagram_url) links.push({ platform: "instagram", url: data.instagram_url, label: "Instagram" });
  if (data.linkedin_url) links.push({ platform: "linkedin", url: data.linkedin_url, label: "LinkedIn" });
  if (data.youtube_url) links.push({ platform: "youtube", url: data.youtube_url, label: "YouTube" });
  if (data.twitter_url) links.push({ platform: "twitter", url: data.twitter_url, label: "Twitter" });

  return links;
}

export async function getCompanyPublicData() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('cms_company')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  return {
    brand_name: data?.brand_name || 'SBBT',
    legal_name: data?.legal_name || 'Shree Badree Build Tech Pvt Ltd',
    tagline: data?.tagline || '',
    logo_url: data?.logo_url || '',
    favicon_url: data?.favicon_url || '',
    phone: data?.phone || '+91 XXXXX XXXXX',
    alternate_mobile: data?.alternate_mobile || '',
    whatsapp: data?.whatsapp || '',
    email: data?.email || 'info@sbbt.in',
    grievance_email: data?.grievance_email || '',
    support_email: data?.support_email || '',
    sales_email: data?.sales_email || '',
    website: data?.website || '',
    address: data?.address || 'Delhi NCR',
    google_maps_url: data?.google_maps_url || '',
    google_rating: data?.google_rating || 0,
    years_experience: data?.years_experience || 0,
    homes_delivered: data?.homes_delivered || 0,
    projects_completed: data?.projects_completed || 0,
    gst: data?.gst || '',
    pan: data?.pan || '',
    business_hours: data?.business_hours || '',
    primary_color: data?.primary_color || '#4f46e5',
    secondary_color: data?.secondary_color || '#06b6d4',
  };
}

export async function saveCompany(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from('cms_company')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  const updateData: Record<string, unknown> = {
    site_id: DEFAULT_SITE_ID,
    // Brand Identity
    brand_name: formData.get('brand_name') as string || currentData?.brand_name || '',
    legal_name: formData.get('legal_name') as string || currentData?.legal_name || '',
    tagline: formData.get('tagline') as string || currentData?.tagline || '',
    logo_url: formData.get('logo_url') as string || currentData?.logo_url || '',
    favicon_url: formData.get('favicon_url') as string || currentData?.favicon_url || '',
    primary_color: formData.get('primary_color') as string || currentData?.primary_color || '#4f46e5',
    secondary_color: formData.get('secondary_color') as string || currentData?.secondary_color || '#06b6d4',

    // Contact Information
    phone: formData.get('phone') as string || currentData?.phone || '',
    alternate_mobile: formData.get('alternate_mobile') as string || currentData?.alternate_mobile || '',
    whatsapp: formData.get('whatsapp') as string || currentData?.whatsapp || '',
    email: formData.get('email') as string || currentData?.email || '',
    grievance_email: formData.get('grievance_email') as string || currentData?.grievance_email || '',
    support_email: formData.get('support_email') as string || currentData?.support_email || '',
    sales_email: formData.get('sales_email') as string || currentData?.sales_email || '',
    website: formData.get('website') as string || currentData?.website || '',

    // Location
    address: formData.get('address') as string || currentData?.address || '',
    google_maps_url: formData.get('google_maps_url') as string || currentData?.google_maps_url || '',

    // Business Metrics
    google_rating: (() => {
      const val = formData.get('google_rating') as string;
      if (val && val.trim() !== '') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? (currentData?.google_rating || 0) : parsed;
      }
      return currentData?.google_rating || 0;
    })(),
    years_experience: (() => {
      const val = formData.get('years_experience') as string;
      if (val && val.trim() !== '') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? (currentData?.years_experience || 0) : parsed;
      }
      return currentData?.years_experience || 0;
    })(),
    homes_delivered: (() => {
      const val = formData.get('homes_delivered') as string;
      if (val && val.trim() !== '') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? (currentData?.homes_delivered || 0) : parsed;
      }
      return currentData?.homes_delivered || 0;
    })(),
    projects_completed: (() => {
      const val = formData.get('projects_completed') as string;
      if (val && val.trim() !== '') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? (currentData?.projects_completed || 0) : parsed;
      }
      return currentData?.projects_completed || 0;
    })(),

    // Business Details
    gst: formData.get('gst') as string || currentData?.gst || '',
    pan: formData.get('pan') as string || currentData?.pan || '',
    currency: formData.get('currency') as string || currentData?.currency || 'INR',
    timezone: formData.get('timezone') as string || currentData?.timezone || 'Asia/Kolkata',
    language: formData.get('language') as string || currentData?.language || 'en',
    business_hours: formData.get('business_hours') as string || currentData?.business_hours || '',

    updated_at: new Date().toISOString(),
  };

  if (currentData) {
    const { error } = await supabase
      .from('cms_company')
      .update(updateData)
      .eq('id', currentData.id);

    if (error) {
      console.error('Error updating company data:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_company')
      .insert(updateData);

    if (error) {
      console.error('Error inserting company data:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Company data saved successfully.' };
}

// ============================================================
// Internal Settings (Admin Only) Actions
// ============================================================

/**
 * Fetch all packages with nested sections and items.
 * Returns CMSPackageFull[] shape for the CMS dashboard.
 */
export async function getAllPackages() {
  const supabase = await createClient();
  const { data: packages, error } = await supabase
    .from('cms_packages')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }

  if (!packages || packages.length === 0) return [];

  const pkgIds = packages.map((p: Record<string, unknown>) => p.id as number);

  const { data: sections } = await supabase
    .from('cms_package_sections')
    .select('*')
    .in('package_id', pkgIds)
    .order('display_order', { ascending: true });

  const sectionIds = (sections || []).map((s: Record<string, unknown>) => s.id as number);

  const { data: items } = await supabase
    .from('cms_package_items')
    .select('*')
    .in('section_id', sectionIds.length > 0 ? sectionIds : [0])
    .order('display_order', { ascending: true });

  const sectionsByPkg: Record<number, Array<Record<string, unknown>>> = {};
  for (const sec of sections || []) {
    const pkgId = sec.package_id as number;
    if (!sectionsByPkg[pkgId]) sectionsByPkg[pkgId] = [];
    sectionsByPkg[pkgId].push(sec);
  }

  const itemsBySection: Record<number, Array<Record<string, unknown>>> = {};
  for (const item of items || []) {
    const secId = item.section_id as number;
    if (!itemsBySection[secId]) itemsBySection[secId] = [];
    itemsBySection[secId].push(item);
  }

  return packages.map((pkg: Record<string, unknown>) => {
    const pkgSections = (sectionsByPkg[pkg.id as number] || []).map((sec: Record<string, unknown>) => ({
      id: sec.id as number,
      title: sec.title as string,
      display_order: sec.display_order as number,
      items: (itemsBySection[sec.id as number] || []).map((item: Record<string, unknown>) => ({
        item: item.item as string,
        brand: item.brand as string,
        specification: item.specification as string,
        remarks: item.remarks as string,
      })),
    }));
    return {
      package: pkg as unknown as CMSPackageFull['package'],
      sections: pkgSections,
    } as CMSPackageFull;
  });
}

// ============================================================
// Image Upload Actions
// ============================================================

export async function uploadImageAction(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string || 'general';

  if (!file) {
    return { success: false, message: 'No file provided.', url: '' };
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { success: false, message: 'File size must be under 5MB.', url: '' };
  }

  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
  const allowedTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

  if (!allowedTypes.includes(fileExt)) {
    return { success: false, message: 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp, svg', url: '' };
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('cms')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    return { success: false, message: `Upload failed: ${uploadError.message}`, url: '' };
  }

  const { data: urlData } = supabase.storage.from('cms').getPublicUrl(filePath);

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Image uploaded successfully.', url: urlData.publicUrl };
}

export async function deleteImageAction(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const url = formData.get('url') as string;

  if (!url) {
    return { success: false, message: 'No URL provided.' };
  }

  // Extract path from URL
  const bucketUrl = supabase.storage.from('cms').getPublicUrl('').data.publicUrl;
  const path = url.replace(bucketUrl, '');

  const { error } = await supabase.storage
    .from('cms')
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    return { success: false, message: `Delete failed: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Image deleted successfully.' };
}

// ============================================================
// Media Manager Actions
// ============================================================

/**
 * List all files in the CMS storage bucket.
 * Optionally filter by folder prefix (e.g. "logos", "hero").
 */
export async function getMediaItems(folder?: string): Promise<CMSMediaItem[]> {
  const supabase = await createClient();

  const bucket = CMS_STORAGE_BUCKET;
  const { data, error } = await supabase.storage.from(bucket).list(folder ? folder + '/' : '', {
    limit: 100,
    sortBy: { column: 'updated_at', order: 'desc' },
  });

  if (error) {
    console.error('Error listing media:', error);
    return [];
  }

  if (!data || data.length === 0) {
    return [];
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl('');
  const bucketBaseUrl = publicUrlData.publicUrl;

  return data.map((file) => ({
    name: file.name,
    public_url: `${bucketBaseUrl}${file.name}`,
    size: file.metadata?.size ?? 0,
    mimetype: file.metadata?.mimetype ?? 'application/octet-stream',
    updated_at: file.updated_at ?? new Date().toISOString(),
  })) as CMSMediaItem[];
}

/**
 * Delete a media file from the CMS storage bucket by its path.
 */
export async function deleteMediaItem(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const path = formData.get('path') as string;

  if (!path) {
    return { success: false, message: 'No file path provided.' };
  }

  const { error } = await supabase.storage
    .from(CMS_STORAGE_BUCKET)
    .remove([path]);

  if (error) {
    console.error('Error deleting media item:', error);
    return { success: false, message: `Delete failed: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'File deleted successfully.' };
}

// ============================================================
// Social Media Actions
// ============================================================

export async function saveSocial(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from('cms_social')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    facebook_url: formData.get('facebook_url') as string || '',
    instagram_url: formData.get('instagram_url') as string || '',
    linkedin_url: formData.get('linkedin_url') as string || '',
    youtube_url: formData.get('youtube_url') as string || '',
    twitter_url: formData.get('twitter_url') as string || '',
  };

  if (currentData) {
    const { error } = await supabase
      .from('cms_social')
      .update(updateData)
      .eq('id', currentData.id);

    if (error) {
      console.error('Error updating social:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_social')
      .insert(updateData);

    if (error) {
      console.error('Error inserting social:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Social links saved successfully.' };
}

// ============================================================
// Settings Actions
// ============================================================

export async function saveSettings(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from('cms_settings')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    footer_text: formData.get('footer_text') as string || '',
    copyright_text: formData.get('copyright_text') as string || '',
    maintenance_mode: formData.get('maintenance_mode') === 'on',
    maintenance_message: formData.get('maintenance_message') as string || '',
    enable_blog: formData.get('enable_blog') === 'on',
    enable_quote: formData.get('enable_quote') === 'on',
    enable_whatsapp: formData.get('enable_whatsapp') === 'on',
    enable_chatbot: formData.get('enable_chatbot') === 'on',
    enable_call_button: formData.get('enable_call_button') === 'on',
  };

  if (currentData) {
    const { error } = await supabase
      .from('cms_settings')
      .update(updateData)
      .eq('id', currentData.id);

    if (error) {
      console.error('Error updating settings:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_settings')
      .insert(updateData);

    if (error) {
      console.error('Error inserting settings:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Settings saved successfully.' };
}

// ============================================================
// Hero Banner Actions
// ============================================================

export async function saveHeroBanner(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const input = {
    title: formData.get('title') as string || '',
    subtitle: formData.get('subtitle') as string || '',
    button_text: formData.get('button_text') as string || '',
    button_link: formData.get('button_link') as string || '/quote',
    image_url: formData.get('image_url') as string || '',
    is_active: true,
  };

  // try to update existing active banner, or insert new
  const { data: existing } = await supabase
    .from('cms_homepage')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('cms_homepage')
      .update({
        hero_heading: input.title,
        hero_subheading: input.subtitle,
        hero_cta_text: input.button_text,
        hero_cta_link: input.button_link,
        hero_background_url: input.image_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating hero banner:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_homepage')
      .insert({
        site_id: DEFAULT_SITE_ID,
        hero_heading: input.title,
        hero_subheading: input.subtitle,
        hero_cta_text: input.button_text,
        hero_cta_link: input.button_link,
        hero_background_url: input.image_url
      });

    if (error) {
      console.error('Error inserting hero banner:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Hero banner saved successfully.' };
}

// ============================================================
// Homepage Actions
// ============================================================

export async function saveHomepage(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from('cms_homepage')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  // Parse stats from JSON string (sent by HomepageForm as hidden input)
  let stats: CMSStat[] = [];
  try {
    const statsRaw = formData.get('stats') as string;
    if (statsRaw) stats = JSON.parse(statsRaw) as CMSStat[];
  } catch {
    // ignore parse errors, keep empty array
  }

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    hero_heading: formData.get('hero_heading') as string || '',
    hero_subheading: formData.get('hero_subheading') as string || '',
    hero_cta_text: formData.get('hero_cta_text') as string || '',
    hero_cta_link: formData.get('hero_cta_link') as string || '',
    hero_background_url: formData.get('hero_background_url') as string || '',
    stats_heading: formData.get('stats_heading') as string || '',
    stats,
  };

  if (currentData) {
    const { error } = await supabase
      .from('cms_homepage')
      .update(updateData)
      .eq('id', currentData.id);

    if (error) {
      console.error('Error updating homepage:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_homepage')
      .insert(updateData);

    if (error) {
      console.error('Error inserting homepage:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Homepage saved successfully.' };
}

// ============================================================
// SEO Actions
// ============================================================

export async function saveSEO(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from('cms_seo')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  // Parse schema_json from JSON string (sent by SEOForm as textarea)
  let schemaJson: Record<string, unknown> = {};
  try {
    const schemaRaw = formData.get('schema_json') as string;
    if (schemaRaw && schemaRaw.trim() !== '') {
      schemaJson = JSON.parse(schemaRaw);
    }
  } catch {
    // Return error for invalid JSON
    return { success: false, message: 'Schema JSON is invalid. Please fix the JSON syntax.' };
  }

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    meta_title: formData.get('meta_title') as string || '',
    meta_description: formData.get('meta_description') as string || '',
    meta_keywords: formData.get('meta_keywords') as string || '',
    og_image_url: formData.get('og_image_url') as string || '',
    canonical_url: formData.get('canonical_url') as string || '',
    robots: formData.get('robots') as string || 'index, follow',
    schema_json: schemaJson,
    twitter_card: formData.get('twitter_card') as string || 'summary_large_image',
    facebook_app_id: formData.get('facebook_app_id') as string || '',
    google_verification: formData.get('google_verification') as string || '',
    bing_verification: formData.get('bing_verification') as string || '',
  };

  if (currentData) {
    const { error } = await supabase
      .from('cms_seo')
      .update(updateData)
      .eq('id', currentData.id);

    if (error) {
      console.error('Error updating SEO:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_seo')
      .insert(updateData);

    if (error) {
      console.error('Error inserting SEO:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'SEO data saved successfully.' };
}

// ============================================================
// Package Actions V3 (Clean Rebuild)
// ============================================================

export async function savePackage(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string || '';
  const slug = formData.get('slug') as string || '';
  const price = parseFloat(formData.get('price') as string) || 0;
  const description = formData.get('description') as string || '';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;
  const isActive = formData.get('is_active') === 'on';

  // Parse sections from JSON hidden input
  let sections: Array<{ title: string; items: Array<{ item: string; brand: string; specification: string; remarks: string }> }> = [];

  try {
    const sectionsRaw = formData.get('sections') as string;
    if (sectionsRaw) sections = JSON.parse(sectionsRaw);
  } catch { /* ignore parse errors */ }

  const packageId = formData.get('package_id') as string;

  // Helper to slugify
  const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const finalSlug = slug || slugify(name);

  if (packageId) {
    // Update existing package
    const { error } = await supabase
      .from('cms_packages')
      .update({
        name,
        slug: finalSlug,
        price,
        description,
        display_order: displayOrder,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(packageId));

    if (error) {
      console.error('Error updating package:', error);
      return { success: false, message: `Failed to save package: ${error.message}` };
    }

    // Delete all old sections + items for this package (cascade)
    const { error: delSectionsErr } = await supabase
      .from('cms_package_sections')
      .delete()
      .eq('package_id', parseInt(packageId));
    if (delSectionsErr) console.error('Error deleting old sections:', delSectionsErr);

    // Re-insert sections + items
    if (sections.length > 0) {
      for (let si = 0; si < sections.length; si++) {
        const section = sections[si];
        const { data: newSection, error: insSectionErr } = await supabase
          .from('cms_package_sections')
          .insert({
            package_id: parseInt(packageId),
            title: section.title || '',
            display_order: si,
          })
          .select('id')
          .single();

        if (insSectionErr) {
          console.error('Error inserting section:', insSectionErr);
          continue;
        }

        if (section.items && section.items.length > 0 && newSection) {
          const { error: insItemsErr } = await supabase
            .from('cms_package_items')
            .insert(section.items.map((item, ii) => ({
              section_id: newSection.id,
              item: item.item || '',
              brand: item.brand || '',
              specification: item.specification || '',
              remarks: item.remarks || '',
              display_order: ii,
            })));
          if (insItemsErr) console.error('Error inserting items:', insItemsErr);
        }
      }
    }
  } else {
    // Insert new package
    const { data: newPkg, error } = await supabase
      .from('cms_packages')
      .insert({
        site_id: DEFAULT_SITE_ID,
        name,
        slug: finalSlug,
        price,
        description,
        display_order: displayOrder,
        is_active: isActive,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting package:', error);
      return { success: false, message: `Failed to save package: ${error.message}` };
    }

    const newId = newPkg.id;

    // Insert sections + items
    if (sections.length > 0) {
      for (let si = 0; si < sections.length; si++) {
        const section = sections[si];
        const { data: newSection, error: insSectionErr } = await supabase
          .from('cms_package_sections')
          .insert({
            package_id: newId,
            title: section.title || '',
            display_order: si,
          })
          .select('id')
          .single();

        if (insSectionErr) {
          console.error('Error inserting section:', insSectionErr);
          continue;
        }

        if (section.items && section.items.length > 0 && newSection) {
          const { error: insItemsErr } = await supabase
            .from('cms_package_items')
            .insert(section.items.map((item, ii) => ({
              section_id: newSection.id,
              item: item.item || '',
              brand: item.brand || '',
              specification: item.specification || '',
              remarks: item.remarks || '',
              display_order: ii,
            })));
          if (insItemsErr) console.error('Error inserting items:', insItemsErr);
        }
      }
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/packages');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Package saved successfully.' };
}

export async function deletePackage(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const packageId = formData.get('package_id') as string;

  if (!packageId) {
    return { success: false, message: 'No package ID provided.' };
  }

  const numericId = parseInt(packageId);

  const { error } = await supabase
    .from('cms_packages')
    .delete()
    .eq('id', numericId);

  if (error) {
    console.error('Error deleting package:', error);
    return { success: false, message: `Failed to delete package: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/packages');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Package deleted successfully.' };
}

export async function togglePackageActive(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const packageId = formData.get('package_id') as string;
  const isActive = formData.get('is_active') === 'on';

  const { error } = await supabase
    .from('cms_packages')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', parseInt(packageId));

  if (error) {
    console.error('Error toggling package:', error);
    return { success: false, message: `Failed to toggle package: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/packages');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Package status toggled.' };
}

// ============================================================
// Project Actions (Minimal re-exports)
// ============================================================

export async function saveProject(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const clientName = formData.get('client_name') as string || '';
  const location = formData.get('location') as string || '';
  const projectType = formData.get('project_type') as string || '';
  const packageUsed = formData.get('package_used') as string || '';
  const plotArea = formData.get('plot_area') as string || '';
  const builtUpArea = formData.get('built_up_area') as string || '';
  const floors = formData.get('floors') as string || '';
  const completionDate = formData.get('completion_date') as string || '';
  const status = formData.get('status') as string || '';
  const shortDescription = formData.get('short_description') as string || '';
  const description = formData.get('description') as string || '';
  const coverImageUrl = formData.get('cover_image_url') as string || '';
  const videoUrl = formData.get('video_url') as string || '';
  const projectValue = formData.get('project_value') as string || '';
  const duration = formData.get('duration') as string || '';
  const teamSize = formData.get('team_size') as string || '';
  const customerRating = parseFloat(formData.get('customer_rating') as string) || 0;
  const isFeatured = formData.get('is_featured') === 'on';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;
  const metaTitle = formData.get('meta_title') as string || '';
  const metaDescription = formData.get('meta_description') as string || '';
  const ogImageUrl = formData.get('og_image_url') as string || '';

  // Parse relational data from JSON hidden inputs
  let gallery: Array<{ image_url: string; caption: string }> = [];
  let beforeImages: Array<{ image_url: string; caption: string }> = [];
  let afterImages: Array<{ image_url: string; caption: string }> = [];

  try {
    const galleryRaw = formData.get('gallery') as string;
    if (galleryRaw) gallery = JSON.parse(galleryRaw);
  } catch { /* ignore parse errors */ }

  try {
    const beforeRaw = formData.get('before_images') as string;
    if (beforeRaw) beforeImages = JSON.parse(beforeRaw);
  } catch { /* ignore parse errors */ }

  try {
    const afterRaw = formData.get('after_images') as string;
    if (afterRaw) afterImages = JSON.parse(afterRaw);
  } catch { /* ignore parse errors */ }

  const projectId = formData.get('project_id') as string;

  if (projectId) {
    const { error } = await supabase
      .from('cms_projects')
      .update({
        name,
        slug,
        client_name: clientName,
        location,
        project_type: projectType,
        package_used: packageUsed,
        plot_area: plotArea,
        built_up_area: builtUpArea,
        floors,
        completion_date: completionDate,
        status,
        short_description: shortDescription,
        description,
        cover_image_url: coverImageUrl,
        video_url: videoUrl,
        project_value: projectValue,
        duration,
        team_size: teamSize,
        customer_rating: customerRating,
        is_featured: isFeatured,
        display_order: displayOrder,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(projectId));

    if (error) {
      console.error('Error updating project:', error);
      return { success: false, message: `Failed to save project: ${error.message}` };
    }

    // Replace gallery
    const { error: delGalleryErr } = await supabase.from('cms_project_gallery').delete().eq('project_id', parseInt(projectId));
    if (delGalleryErr) console.error('Error deleting old gallery:', delGalleryErr);
    if (gallery.length > 0) {
      const { error: insGalleryErr } = await supabase.from('cms_project_gallery').insert(
        gallery.map((g, i) => ({ site_id: DEFAULT_SITE_ID, project_id: parseInt(projectId), image_url: g.image_url || '', caption: g.caption || '', display_order: i }))
      );
      if (insGalleryErr) console.error('Error inserting gallery:', insGalleryErr);
    }

    // Replace before_images
    const { error: delBeforeErr } = await supabase.from('cms_project_before_images').delete().eq('project_id', parseInt(projectId));
    if (delBeforeErr) console.error('Error deleting old before:', delBeforeErr);
    if (beforeImages.length > 0) {
      const { error: insBeforeErr } = await supabase.from('cms_project_before_images').insert(
        beforeImages.map((b, i) => ({ site_id: DEFAULT_SITE_ID, project_id: parseInt(projectId), image_url: b.image_url || '', caption: b.caption || '', display_order: i }))
      );
      if (insBeforeErr) console.error('Error inserting before:', insBeforeErr);
    }

    // Replace after_images
    const { error: delAfterErr } = await supabase.from('cms_project_after_images').delete().eq('project_id', parseInt(projectId));
    if (delAfterErr) console.error('Error deleting old after:', delAfterErr);
    if (afterImages.length > 0) {
      const { error: insAfterErr } = await supabase.from('cms_project_after_images').insert(
        afterImages.map((a, i) => ({ site_id: DEFAULT_SITE_ID, project_id: parseInt(projectId), image_url: a.image_url || '', caption: a.caption || '', display_order: i }))
      );
      if (insAfterErr) console.error('Error inserting after:', insAfterErr);
    }
  } else {
    const { data: newProj, error } = await supabase
      .from('cms_projects')
      .insert({
        site_id: DEFAULT_SITE_ID,
        name,
        slug,
        client_name: clientName,
        location,
        project_type: projectType,
        package_used: packageUsed,
        plot_area: plotArea,
        built_up_area: builtUpArea,
        floors,
        completion_date: completionDate,
        status,
        short_description: shortDescription,
        description,
        cover_image_url: coverImageUrl,
        video_url: videoUrl,
        project_value: projectValue,
        duration,
        team_size: teamSize,
        customer_rating: customerRating,
        is_active: true,
        is_featured: isFeatured,
        display_order: displayOrder,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error inserting project:', error);
      return { success: false, message: `Failed to save project: ${error.message}` };
    }

    const newId = newProj.id;

    if (gallery.length > 0) {
      const { error: insGalleryErr } = await supabase.from('cms_project_gallery').insert(
        gallery.map((g, i) => ({ site_id: DEFAULT_SITE_ID, project_id: newId, image_url: g.image_url || '', caption: g.caption || '', display_order: i }))
      );
      if (insGalleryErr) console.error('Error inserting gallery:', insGalleryErr);
    }

    if (beforeImages.length > 0) {
      const { error: insBeforeErr } = await supabase.from('cms_project_before_images').insert(
        beforeImages.map((b, i) => ({ site_id: DEFAULT_SITE_ID, project_id: newId, image_url: b.image_url || '', caption: b.caption || '', display_order: i }))
      );
      if (insBeforeErr) console.error('Error inserting before:', insBeforeErr);
    }

    if (afterImages.length > 0) {
      const { error: insAfterErr } = await supabase.from('cms_project_after_images').insert(
        afterImages.map((a, i) => ({ site_id: DEFAULT_SITE_ID, project_id: newId, image_url: a.image_url || '', caption: a.caption || '', display_order: i }))
      );
      if (insAfterErr) console.error('Error inserting after:', insAfterErr);
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/projects');
  return { success: true, message: 'Project saved successfully.' };
}

export async function deleteProject(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get('project_id') as string;

  if (!projectId) {
    return { success: false, message: 'No project ID provided.' };
  }

  const numericId = parseInt(projectId);

  // Clean up child relations first to avoid orphaned rows
  await supabase.from('cms_project_gallery').delete().eq('project_id', numericId);
  await supabase.from('cms_project_before_images').delete().eq('project_id', numericId);
  await supabase.from('cms_project_after_images').delete().eq('project_id', numericId);

  const { error } = await supabase
    .from('cms_projects')
    .delete()
    .eq('id', numericId);

  if (error) {
    console.error('Error deleting project:', error);
    return { success: false, message: `Failed to delete project: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/projects');
  return { success: true, message: 'Project deleted successfully.' };
}

export async function toggleProjectActive(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get('project_id') as string;
  const isActive = formData.get('is_active') === 'on';

  const { error } = await supabase
    .from('cms_projects')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', parseInt(projectId));

  if (error) {
    console.error('Error toggling project:', error);
    return { success: false, message: `Failed to toggle project: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Project status toggled.' };
}

// ============================================================
// List Data Fetching
// ============================================================

export async function getAllProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_projects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    project: row,
    gallery: [],
    beforeImages: [],
    afterImages: [],
})) as unknown as CMSProjectFull[];
}

export async function toggleProjectFeatured(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get('project_id') as string;
  const isFeatured = formData.get('is_featured') === 'on';

  const { error } = await supabase
    .from('cms_projects')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq('id', parseInt(projectId));

  if (error) {
    console.error('Error toggling project featured:', error);
    return { success: false, message: `Failed to toggle featured: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Project featured status toggled.' };
}

// ============================================================
// Blog Actions
// ============================================================

export async function getBlogs() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_blogs')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }

  return data || [];
}

export async function saveBlog(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const blogId = formData.get('id') as string;
  const title = formData.get('title') as string || '';
  const slug = formData.get('slug') as string || '';
  const excerpt = formData.get('excerpt') as string || '';
  const content = formData.get('content') as string || '';
  const featuredImageUrl = formData.get('featured_image_url') as string || '';
  const author = formData.get('author') as string || '';
  const tags = formData.get('tags') as string || '';
  const metaTitle = formData.get('meta_title') as string || '';
  const metaDescription = formData.get('meta_description') as string || '';
  const isPublished = formData.get('is_published') === 'on';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;

  if (!title) {
    return { success: false, message: 'Title is required.' };
  }

  if (!slug) {
    return { success: false, message: 'Slug is required.' };
  }

  if (blogId) {
    const { error } = await supabase
      .from('cms_blogs')
      .update({
        title,
        slug,
        excerpt,
        content,
        featured_image_url: featuredImageUrl,
        author,
        tags,
        meta_title: metaTitle,
        meta_description: metaDescription,
        is_published: isPublished,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(blogId));

    if (error) {
      console.error('Error updating blog:', error);
      return { success: false, message: `Failed to save blog: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_blogs')
      .insert({
        site_id: DEFAULT_SITE_ID,
        title,
        slug,
        excerpt,
        content,
        featured_image_url: featuredImageUrl,
        author,
        tags,
        meta_title: metaTitle,
        meta_description: metaDescription,
        is_published: isPublished,
        display_order: displayOrder,
      });

    if (error) {
      console.error('Error inserting blog:', error);
      return { success: false, message: `Failed to save blog: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/blogs');
  return { success: true, message: 'Blog saved successfully.' };
}

export async function deleteBlog(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const blogId = formData.get('id') as string;

  if (!blogId) {
    return { success: false, message: 'No blog ID provided.' };
  }

  const { error } = await supabase
    .from('cms_blogs')
    .delete()
    .eq('id', parseInt(blogId));

  if (error) {
    console.error('Error deleting blog:', error);
    return { success: false, message: `Failed to delete blog: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/blogs');
  return { success: true, message: 'Blog deleted successfully.' };
}

export async function toggleBlogPublished(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const blogId = formData.get('id') as string;
  const isPublished = formData.get('is_published') === 'on';

  const { error } = await supabase
    .from('cms_blogs')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', parseInt(blogId));

  if (error) {
    console.error('Error toggling blog published:', error);
    return { success: false, message: `Failed to toggle blog: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/blogs');
  return { success: true, message: 'Blog publish status toggled.' };
}

// ============================================================
// Testimonial Actions
// ============================================================

export async function getTestimonials() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_testimonials')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }

  return data || [];
}

export async function saveTestimonial(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const testimonialId = formData.get('id') as string;
  const clientName = formData.get('client_name') as string || '';
  const designation = formData.get('designation') as string || '';
  const projectName = formData.get('project_name') as string || '';
  const location = formData.get('location') as string || '';
  const rating = parseInt(formData.get('rating') as string) || 5;
  const testimonial = formData.get('testimonial') as string || '';
  const imageUrl = formData.get('image_url') as string || '';
  const isFeatured = formData.get('is_featured') === 'on';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;

  if (!clientName) {
    return { success: false, message: 'Client name is required.' };
  }

  if (!testimonial) {
    return { success: false, message: 'Testimonial content is required.' };
  }

  if (testimonialId) {
    const { error } = await supabase
      .from('cms_testimonials')
      .update({
        client_name: clientName,
        designation,
        project_name: projectName,
        location,
        rating,
        testimonial,
        image_url: imageUrl,
        is_featured: isFeatured,
        display_order: displayOrder,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(testimonialId));

    if (error) {
      console.error('Error updating testimonial:', error);
      return { success: false, message: `Failed to save testimonial: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_testimonials')
      .insert({
        site_id: DEFAULT_SITE_ID,
        client_name: clientName,
        designation,
        project_name: projectName,
        location,
        rating,
        testimonial,
        image_url: imageUrl,
        is_featured: isFeatured,
        display_order: displayOrder,
      });

    if (error) {
      console.error('Error inserting testimonial:', error);
      return { success: false, message: `Failed to save testimonial: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Testimonial saved successfully.' };
}

export async function deleteTestimonial(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const testimonialId = formData.get('id') as string;

  if (!testimonialId) {
    return { success: false, message: 'No testimonial ID provided.' };
  }

  const { error } = await supabase
    .from('cms_testimonials')
    .delete()
    .eq('id', parseInt(testimonialId));

  if (error) {
    console.error('Error deleting testimonial:', error);
    return { success: false, message: `Failed to delete testimonial: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Testimonial deleted successfully.' };
}

export async function toggleTestimonialFeatured(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const testimonialId = formData.get('id') as string;
  const isFeatured = formData.get('is_featured') === 'on';

  const { error } = await supabase
    .from('cms_testimonials')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq('id', parseInt(testimonialId));

  if (error) {
    console.error('Error toggling testimonial featured:', error);
    return { success: false, message: `Failed to toggle testimonial: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Testimonial featured status toggled.' };
}

// ============================================================
// Brand Actions
// ============================================================

export async function getBrands() {
const supabase = await createClient();
const { data, error } = await supabase
.from('cms_brands')
.select('*')
.order('display_order', { ascending: true });

if (error) {
console.error('Error fetching brands:', error);
return [];
}

return data || [];
}

export async function saveBrand(prevState: { success: boolean; message: string }, formData: FormData) {
const supabase = await createClient();

const brandId = formData.get('id') as string;
const name = formData.get('name') as string || '';
const category = formData.get('category') as string || '';
const logoUrl = formData.get('logo_url') as string || '';
const websiteUrl = formData.get('website_url') as string || '';
const displayOrder = parseInt(formData.get('display_order') as string) || 0;
const isActive = formData.get('is_active') === 'on';

if (!name) {
return { success: false, message: 'Brand name is required.' };
}

  if (brandId) {
    const updatePayload = {
      name,
      category,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    };
    console.log('[saveBrand][DEBUG] UPDATE payload:', updatePayload);
    const { data, error } = await supabase
      .from('cms_brands')
      .update(updatePayload)
      .eq('id', parseInt(brandId))
      .select();

    console.log('[saveBrand][DEBUG] UPDATE response:', { data, error: error ? { message: error.message, name: error.name } : null });

    if (error) {
      console.error('Error updating brand:', error);
      return { success: false, message: `Failed to save brand: ${error.message}` };
    }
  } else {
    const insertPayload = {
      site_id: DEFAULT_SITE_ID,
      name,
      category,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: isActive,
    };
    console.log('[saveBrand][DEBUG] INSERT payload:', insertPayload);
    const { data, error } = await supabase
      .from('cms_brands')
      .insert(insertPayload)
      .select();

    console.log('[saveBrand][DEBUG] INSERT response:', { data, error: error ? { message: error.message, name: error.name } : null });

    if (error) {
      console.error('Error inserting brand:', error);
      return { success: false, message: `Failed to save brand: ${error.message}` };
    }
  }

revalidatePath('/dashboard/cms');
revalidatePath('/', 'layout');
return { success: true, message: 'Brand saved successfully.' };
}

export async function deleteBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
const supabase = await createClient();

const brandId = formData.get('id') as string;

if (!brandId) {
return { success: false, message: 'No brand ID provided.' };
}

const { error } = await supabase
.from('cms_brands')
.delete()
.eq('id', parseInt(brandId));

if (error) {
console.error('Error deleting brand:', error);
return { success: false, message: `Failed to delete brand: ${error.message}` };
}

revalidatePath('/dashboard/cms');
revalidatePath('/', 'layout');
return { success: true, message: 'Brand deleted successfully.' };
}

export async function toggleBrandActive(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const brandId = formData.get('id') as string;
  const isActive = formData.get('is_active') === 'on';

  const { error } = await supabase
    .from('cms_brands')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', parseInt(brandId));

  if (error) {
    console.error('Error toggling brand:', error);
    return { success: false, message: `Failed to toggle brand: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand active status toggled.' };
}

export async function duplicateBrand(_prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string || '';
  const category = formData.get('category') as string || '';
  const logoUrl = formData.get('logo_url') as string || '';
  const websiteUrl = formData.get('website_url') as string || '';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;
  const isActive = formData.get('is_active') === 'on';

  if (!name) {
    return { success: false, message: 'Brand name is required for duplication.' };
  }

  const { error } = await supabase
    .from('cms_brands')
    .insert({
      site_id: DEFAULT_SITE_ID,
      name: name + ' (Copy)',
      category,
      logo_url: logoUrl,
      website_url: websiteUrl,
      display_order: displayOrder,
      is_active: false,
    });

  if (error) {
    console.error('Error duplicating brand:', error);
    return { success: false, message: `Failed to duplicate brand: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  revalidatePath('/', 'layout');
  return { success: true, message: 'Brand duplicated successfully.' };
}

// ─── Internal Settings ───────────────────────────────────────────────────────

export async function saveInternalSettings(
  prevState: { success: boolean; message: string },
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient();

  const fields = [
    'lead_notification_email',
    'sales_email',
    'quotation_email',
    'support_email',
    'accounts_email',
    'google_sheet_url',
    'webhook_url',
    'whatsapp_api_number',
  ] as const;

  const payload: Record<string, string> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === 'string') {
      payload[field] = value;
    }
  }

  payload.smtp_ready = formData.get('smtp_ready') === 'on' ? 'true' : 'false';
  payload.resend_ready = formData.get('resend_ready') === 'on' ? 'true' : 'false';

  const { error } = await supabase
    .from('cms_internal_settings')
    .upsert(
      { id: 1, ...payload, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

  if (error) {
    console.error('Error saving internal settings:', error);
    return { success: false, message: `Failed to save: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Internal settings saved.' };
}
