import { supabase } from '../lib/supabase';

export const PROVAS_BUCKET = 'provas-forenses';

/**
 * Upload a forensic evidence file to Supabase Storage.
 * Files are stored under {userId}/{timestamp}-{random}.{ext}
 * The bucket is private — use getProvaFileUrl() to generate signed URLs.
 *
 * @returns {string} storage path (not a URL)
 */
export async function uploadProvaFile(userId, file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `${userId}/${Date.now()}-${rand}.${ext}`;

  const { data, error } = await supabase.storage
    .from(PROVAS_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000', // 1 year — evidence files are immutable
      upsert: false,
      contentType: file.type,
    });
  if (error) throw error;

  return data.path;
}

/**
 * Generate a time-limited signed URL for a private evidence file.
 *
 * @param {string} path       - storage path returned by uploadProvaFile
 * @param {number} expiresIn  - seconds until the URL expires (default 1 hour)
 */
export async function getProvaFileUrl(path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(PROVAS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
