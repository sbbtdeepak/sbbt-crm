import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "projects";

function getFileExtension(filename: string) {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.at(-1)?.toLowerCase() ?? "jpg" : "jpg";
}

export async function uploadProjectImages(
  supabase: SupabaseClient,
  projectId: string,
  files: File[],
  startOrder = 0
) {
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const extension = getFileExtension(file.name);
    const storagePath = `${projectId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

    const { error: insertError } = await supabase.from("project_images").insert({
      project_id: projectId,
      image_url: publicUrl,
      storage_path: storagePath,
      sort_order: startOrder + index,
    });

    if (insertError) {
      await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
      throw new Error(insertError.message);
    }
  }
}

export async function deleteProjectImagesByIds(
  supabase: SupabaseClient,
  imageIds: string[]
) {
  if (imageIds.length === 0) {
    return;
  }

  const { data: images, error: fetchError } = await supabase
    .from("project_images")
    .select("id, storage_path")
    .in("id", imageIds);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const storagePaths = (images ?? []).map((image) => image.storage_path);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(storagePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error: deleteError } = await supabase
    .from("project_images")
    .delete()
    .in("id", imageIds);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function deleteAllProjectImages(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data: images, error: fetchError } = await supabase
    .from("project_images")
    .select("storage_path")
    .eq("project_id", projectId);

  if (fetchError) {
    throw new Error(fetchError.message);
  }

  const storagePaths = (images ?? []).map((image) => image.storage_path);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(storagePaths);

    if (storageError) {
      throw new Error(storageError.message);
    }
  }

  const { error: deleteError } = await supabase
    .from("project_images")
    .delete()
    .eq("project_id", projectId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }
}

export async function getNextImageSortOrder(
  supabase: SupabaseClient,
  projectId: string
) {
  const { data, error } = await supabase
    .from("project_images")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? data.sort_order + 1 : 0;
}
