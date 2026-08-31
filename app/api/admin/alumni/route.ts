import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "alumni.json");
function read() { try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return []; } }
function write(list: any[]) { fs.writeFileSync(filePath, JSON.stringify(list, null, 2)); }
function check(req: NextRequest) {
  const r = req.cookies.get("ayaan_admin_role")?.value || "super_admin";
  return r === "super_admin";
}

export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(read(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, name, role, batch, course, quote, video, image, featured } = body;
  if (!name || !quote) return NextResponse.json({ error: "name and quote required" }, { status: 400 });
  const list = read();
  const item = {
    id: id || `ALU-${Date.now()}`,
    name: String(name).trim(),
    role: String(role || ""),
    batch: String(batch || ""),
    course: String(course || "General"),
    quote: String(quote).trim(),
    video: String(video || ""),
    image: String(image || ""),
    featured: !!featured,
    createdAt: body.createdAt || new Date().toISOString().slice(0, 10),
  };
  const idx = list.findIndex((x: any) => x.id === item.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...item };
  else list.unshift(item);
  write(list);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = read().filter((x: any) => x.id !== id);
  write(list);
  return NextResponse.json({ ok: true });
}
