import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET = "alumni";
const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

async function ensureBucket() {
  const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
  if (error) throw new Error(`Storage error: ${error.message}`);
  if (!buckets?.find((b) => b.name === BUCKET)) {
    const { error: createError } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true });
    if (createError) throw new Error(`Cannot create bucket: ${createError.message}`);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;

  let file: File | null = null;
  try {
    const form = await req.formData();
    file = form.get("file") as File | null;
  } catch {
    return NextResponse.json({ error: "Invalid upload (expect multipart file)" }, { status: 400 });
  }
  if (!file || file.size === 0) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG or WEBP images allowed" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });

  try {
    await ensureBucket();
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());

  const { error: upError } = await supabaseAdmin.storage.from(BUCKET).upload(path, buf, {
    contentType: file.type,
    upsert: false,
  });
  if (upError) return NextResponse.json({ error: `Upload failed: ${upError.message}` }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl, path });
}
