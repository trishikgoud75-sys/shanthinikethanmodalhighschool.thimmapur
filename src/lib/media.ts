import { supabase } from "@/integrations/supabase/client";

export const MEDIA_BUCKET = "school-media";

const cache = new Map<string, string>();

/** Resolves a stored media reference to a displayable URL. */
export async function resolveMediaUrl(ref: string | null | undefined): Promise<string | null> {
  if (!ref) return null;
  if (/^https?:\/\//.test(ref) || ref.startsWith("data:")) return ref;
  const cached = cache.get(ref);
  if (cached) return cached;
  const { data } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(ref, 60 * 60 * 24 * 7);
  if (!data?.signedUrl) return null;
  cache.set(ref, data.signedUrl);
  return data.signedUrl;
}

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Downscales and re-encodes a photo in the browser so uploads stay small and
 * the site loads fast. Non-image files and formats we should not re-encode
 * (SVG, GIF) are returned unchanged.
 */
async function compressImage(file: File): Promise<{ blob: Blob; ext: string }> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
    return { blob: file, ext: file.name.split(".").pop() ?? "bin" };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!blob || blob.size >= file.size) {
      return { blob: file, ext: file.name.split(".").pop() ?? "jpg" };
    }
    return { blob, ext: "jpg" };
  } catch {
    return { blob: file, ext: file.name.split(".").pop() ?? "jpg" };
  }
}

/** Uploads a file to the shared media bucket and returns its storage path. */
export async function uploadMedia(file: File, folder: string): Promise<string> {
  const { blob, ext } = await compressImage(file);
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, blob, {
    cacheControl: "3600",
    upsert: false,
    contentType: blob.type || file.type,
  });
  if (error) throw error;
  return path;
}
