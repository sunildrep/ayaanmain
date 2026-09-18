import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { supabaseAdmin } from "@/lib/supabase";
import { ensureBucket, ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/storage";

const BUCKET = "carousel";

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
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) return NextResponse.json({ error: "Only JPG, PNG or WEBP images allowed" }, { status: 400 });
  if (file.size > MAX_IMAGE_BYTES) return NextResponse.json({ error: "Image must be under 2MB" }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  const isJpeg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  const isWebp = buf.length > 11 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
  if (!isJpeg && !isPng && !isWebp) return NextResponse.json({ error: "Image content does not match JPG/PNG/WEBP" }, { status: 400 });
  const mimeOk: Record<string, boolean> = { "image/jpeg": isJpeg, "image/png": isPng, "image/webp": isWebp };
  if (!mimeOk[file.type]) return NextResponse.json({ error: "MIME type does not match file content" }, { status: 400 });

  try { await ensureBucket(BUCKET); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }

  const ext = isPng ? "png" : isWebp ? "webp" : "jpg";
  const filePath = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upError } = await supabaseAdmin.storage.from(BUCKET).upload(filePath, buf, { contentType: file.type, upsert: false });
  if (upError) return NextResponse.json({ error: `Upload failed: ${upError.message}` }, { status: 500 });

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(filePath);
  return NextResponse.json({ ok: true, url: data.publicUrl, path: filePath });
}
