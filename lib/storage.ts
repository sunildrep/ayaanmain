import { supabaseAdmin } from "@/lib/supabase";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 2 * 1024 * 1024;

async function ensureBucket(bucket: string) {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw new Error(`Storage error: ${error.message}`);
  if (!buckets?.find((b) => b.name === bucket)) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, { public: true });
    if (createError) throw new Error(`Cannot create bucket: ${createError.message}`);
  }
}

// Accepts a dataURL (data:image/jpeg;base64,...) or raw base64 + mime, validates, uploads, returns public URL
export async function uploadDataUrl(bucket: string, dataUrl: string, prefix: string): Promise<string> {
  const m = String(dataUrl || "").match(/^data:(image\/(jpeg|png|webp));base64,(.+)$/);
  if (!m) throw new Error("Invalid image (expect JPG/PNG/WEBP data URL)");
  const mime = m[1];
  if (!ALLOWED.includes(mime)) throw new Error("Only JPG, PNG or WEBP images allowed");
  const buf = Buffer.from(m[3], "base64");
  if (buf.length === 0) throw new Error("Empty image");
  if (buf.length > MAX_BYTES) throw new Error("Image must be under 2MB");
  await ensureBucket(bucket);
  const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  const path = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabaseAdmin.storage.from(bucket).upload(path, buf, { contentType: mime, upsert: false });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
