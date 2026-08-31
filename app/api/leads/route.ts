import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "leads.json");
function read() { try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return []; } }
function write(list: any[]) { fs.writeFileSync(filePath, JSON.stringify(list, null, 2)); }

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, phone, course, medium, mode, batchId } = body;
  if (!name || !String(name).trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  if (!phone || !/^[0-9]{10}$/.test(String(phone).trim())) return NextResponse.json({ error: "Valid 10-digit mobile required" }, { status: 400 });

  const list = read();
  const entry = {
    id: `LEAD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    name: String(name).trim(),
    phone: String(phone).trim(),
    course: String(course || ""),
    medium: String(medium || ""),
    mode: String(mode || ""),
    batchId: batchId || null,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  list.unshift(entry);
  write(list);
  return NextResponse.json({ ok: true, id: entry.id });
}
