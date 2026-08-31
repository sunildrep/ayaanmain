import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "batches.json");

function read() {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return [];
  }
}

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const list = read();
  const item = {
    id: body.id || `${body.course}-${Date.now()}`.toLowerCase().replace(/\s+/g, "-"),
    course: String(body.course || "SI"),
    medium: String(body.medium || "Telugu"),
    mode: String(body.mode || "Residential"),
    startDate: String(body.startDate || new Date().toISOString().slice(0, 10)),
    seats: Number(body.seats || 60),
    filled: Number(body.filled || 0),
    duration: String(body.duration || "3 Months"),
    status: body.status === "closed" ? "closed" : "open",
    note: String(body.note || "").slice(0, 200),
  };
  const idx = list.findIndex((x: any) => x.id === item.id);
  if (idx >= 0) list[idx] = item;
  else list.unshift(item);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = read().filter((x: any) => x.id !== id);
  fs.writeFileSync(filePath, JSON.stringify(list, null, 2));
  return NextResponse.json({ ok: true });
}
