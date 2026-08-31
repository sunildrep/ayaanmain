import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "leads.json");
function read() { try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return []; } }
function write(list: any[]) { fs.writeFileSync(filePath, JSON.stringify(list, null, 2)); }

export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = read();
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, status } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = read();
  const idx = list.findIndex((x: any) => x.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (status) list[idx].status = String(status);
  write(list);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = read().filter((x: any) => x.id !== id);
  write(list);
  return NextResponse.json({ ok: true });
}
