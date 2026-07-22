'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type {
  CMSCompanyRow,
  CMSInternalSettingsRow,
} from './types';
import { DEFAULT_SITE_ID } from './types';

// ============================================================
// Company (Public) Actions
// ============================================================

export async function getCompanyData() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_company')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .single();

  if (error) {
    console.error('Error fetching company data:', error);
    return null;
  }

  return data as CMSCompanyRow | null;
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
    .single();

  if (!currentData) {
    return { success: false, message: 'No company data found. Please seed the database first.' };
  }

  const updateData: Record<string, unknown> = {
    // Brand Identity
    brand_name: formData.get('brand_name') as string || currentData.brand_name,
    legal_name: formData.get('legal_name') as string || currentData.legal_name,
    tagline: formData.get('tagline') as string || currentData.tagline,
    logo_url: formData.get('logo_url') as string || currentData.logo_url,
    favicon_url: formData.get('favicon_url') as string || currentData.favicon_url,
    primary_color: formData.get('primary_color') as string || currentData.primary_color,
    secondary_color: formData.get('secondary_color') as string || currentData.secondary_color,

    // Contact Information
    phone: formData.get('phone') as string || currentData.phone,
    alternate_mobile: formData.get('alternate_mobile') as string || currentData.alternate_mobile,
    whatsapp: formData.get('whatsapp') as string || currentData.whatsapp,
    email: formData.get('email') as string || currentData.email,
    grievance_email: formData.get('grievance_email') as string || currentData.grievance_email,
    support_email: formData.get('support_email') as string || currentData.support_email,
    sales_email: formData.get('sales_email') as string || currentData.sales_email,
    website: formData.get('website') as string || currentData.website,

    // Location
    address: formData.get('address') as string || currentData.address,
    google_maps_url: formData.get('google_maps_url') as string || currentData.google_maps_url,

    // Business Metrics
    google_rating: formData.get('google_rating')
      ? parseFloat(formData.get('google_rating') as string)
      : currentData.google_rating,
    years_experience: formData.get('years_experience')
      ? parseInt(formData.get('years_experience') as string)
      : currentData.years_experience,
    homes_delivered: formData.get('homes_delivered')
      ? parseInt(formData.get('homes_delivered') as string)
      : currentData.homes_delivered,
    projects_completed: formData.get('projects_completed')
      ? parseInt(formData.get('projects_completed') as string)
      : currentData.projects_completed,

    // Business Details
    gst: formData.get('gst') as string || currentData.gst,
    pan: formData.get('pan') as string || currentData.pan,
    currency: formData.get('currency') as string || currentData.currency,
    timezone: formData.get('timezone') as string || currentData.timezone,
    language: formData.get('language') as string || currentData.language,
    business_hours: formData.get('business_hours') as string || currentData.business_hours,

    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('cms_company')
    .update(updateData)
    .eq('id', currentData.id);

  if (error) {
    console.error('Error updating company data:', error);
    return { success: false, message: `Failed to save: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Company data saved successfully.' };
}

// ============================================================
// Internal Settings (Admin Only) Actions
// ============================================================

export async function getInternalSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_internal_settings')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  if (error) {
    console.error('Error fetching internal settings:', error);
    return null;
  }

  return data as CMSInternalSettingsRow | null;
}

export async function saveInternalSettings(prevState: { success: boolean; message: string }, formData: FormData) {
  const supabase = await createClient();

  const { data: currentData } = await supabase
    .from('cms_internal_settings')
    .select('*')
    .eq('site_id', DEFAULT_SITE_ID)
    .maybeSingle();

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    lead_notification_email: formData.get('lead_notification_email') as string || '',
    sales_email: formData.get('sales_email') as string || '',
    quotation_email: formData.get('quotation_email') as string || '',
    support_email: formData.get('support_email') as string || '',
    accounts_email: formData.get('accounts_email') as string || '',
    google_sheet_url: formData.get('google_sheet_url') as string || '',
    webhook_url: formData.get('webhook_url') as string || '',
    smtp_ready: formData.get('smtp_ready') === 'on',
    resend_ready: formData.get('resend_ready') === 'on',
    whatsapp_api_number: formData.get('whatsapp_api_number') as string || '',
    updated_at: new Date().toISOString(),
  };

  if (currentData) {
    const { error } = await supabase
      .from('cms_internal_settings')
      .update(updateData)
      .eq('id', currentData.id);

    if (error) {
      console.error('Error updating internal settings:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('cms_internal_settings')
      .insert(updateData);

    if (error) {
      console.error('Error inserting internal settings:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Internal settings saved successfully.' };
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

  // Try to update existing active banner, or insert new
  const { data: existing } = await supabase
    .from('hero_banner')
    .select('*')
    .eq('is_active', true)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('hero_banner')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    if (error) {
      console.error('Error updating hero banner:', error);
      return { success: false, message: `Failed to save: ${error.message}` };
    }
  } else {
    const { error } = await supabase
      .from('hero_banner')
      .insert({ ...input, site_id: DEFAULT_SITE_ID });

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

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    hero_heading: formData.get('hero_heading') as string || '',
    hero_subheading: formData.get('hero_subheading') as string || '',
    hero_cta_text: formData.get('hero_cta_text') as string || '',
    hero_cta_link: formData.get('hero_cta_link') as string || '',
    hero_background_url: formData.get('hero_background_url') as string || '',
    stats_heading: formData.get('stats_heading') as string || '',
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

  const updateData = {
    site_id: DEFAULT_SITE_ID,
    meta_title: formData.get('meta_title') as string || '',
    meta_description: formData.get('meta_description') as string || '',
    meta_keywords: formData.get('meta_keywords') as string || '',
    og_image_url: formData.get('og_image_url') as string || '',
    canonical_url: formData.get('canonical_url') as string || '',
    robots: formData.get('robots') as string || 'index, follow',
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
// Package Actions (Re-export from package actions file)
// ============================================================

export async function savePackage(prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const price = parseFloat(formData.get('price') as string) || 0;
  const shortDescription = formData.get('short_description') as string || '';
  const description = formData.get('description') as string || '';
  const displayOrder = parseInt(formData.get('display_order') as string) || 0;
  const isActive = formData.get('is_active') === 'on';
  const thumbnailUrl = formData.get('thumbnail_url') as string || '';
  const bannerUrl = formData.get('banner_url') as string || '';
  const metaTitle = formData.get('meta_title') as string || '';
  const metaDescription = formData.get('meta_description') as string || '';
  const ogImageUrl = formData.get('og_image_url') as string || '';

  const packageId = formData.get('package_id') as string;

  if (packageId) {
    // Update existing
    const { error } = await supabase
      .from('cms_packages')
      .update({
        name,
        slug,
        price,
        short_description: shortDescription,
        description,
        display_order: displayOrder,
        is_active: isActive,
        thumbnail_url: thumbnailUrl,
        banner_url: bannerUrl,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(packageId));

    if (error) {
      console.error('Error updating package:', error);
      return { success: false, message: `Failed to save package: ${error.message}` };
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('cms_packages')
      .insert({
        site_id: DEFAULT_SITE_ID,
        name,
        slug,
        price,
        short_description: shortDescription,
        description,
        display_order: displayOrder,
        is_active: isActive,
        thumbnail_url: thumbnailUrl,
        banner_url: bannerUrl,
        meta_title: metaTitle,
        meta_description: metaDescription,
        og_image_url: ogImageUrl,
      });

    if (error) {
      console.error('Error inserting package:', error);
      return { success: false, message: `Failed to save package: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Package saved successfully.' };
}

export async function deletePackage(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const packageId = formData.get('package_id') as string;

  if (!packageId) {
    return { success: false, message: 'No package ID provided.' };
  }

  const { error } = await supabase
    .from('cms_packages')
    .delete()
    .eq('id', parseInt(packageId));

  if (error) {
    console.error('Error deleting package:', error);
    return { success: false, message: `Failed to delete package: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
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
  } else {
    const { error } = await supabase
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
      });

    if (error) {
      console.error('Error inserting project:', error);
      return { success: false, message: `Failed to save project: ${error.message}` };
    }
  }

  revalidatePath('/dashboard/cms');
  return { success: true, message: 'Project saved successfully.' };
}

export async function deleteProject(_prevState: unknown, formData: FormData) {
  const supabase = await createClient();

  const projectId = formData.get('project_id') as string;

  if (!projectId) {
    return { success: false, message: 'No project ID provided.' };
  }

  const { error } = await supabase
    .from('cms_projects')
    .delete()
    .eq('id', parseInt(projectId));

  if (error) {
    console.error('Error deleting project:', error);
    return { success: false, message: `Failed to delete project: ${error.message}` };
  }

  revalidatePath('/dashboard/cms');
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

export async function getAllPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('cms_packages')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching packages:', error);
    return [];
  }

  return data || [];
}

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

  return data || [];
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
