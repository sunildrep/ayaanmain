import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "expenses.json");
function read() { try { return JSON.parse(fs.readFileSync(filePath, "utf-8")); } catch { return []; } }
function write(list: any[]) { fs.writeFileSync(filePath, JSON.stringify(list, null, 2)); }
function check(req: NextRequest, allowed: string[]) {
  const r = req.cookies.get("ayaan_admin_role")?.value || "super_admin";
  return allowed.includes(r);
}

export async function GET(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req, ["super_admin", "finance"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(read(), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req, ["super_admin", "finance"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, title, category, amount, dueDate, status, vendor, notes } = body;
  if (!title || amount === undefined) return NextResponse.json({ error: "title and amount required" }, { status: 400 });
  const list = read();
  const item = {
    id: id || `EXP-${Date.now()}`,
    title: String(title),
    category: String(category || "General"),
    amount: Number(amount),
    dueDate: dueDate || new Date().toISOString().slice(0, 10),
    status: status === "paid" ? "paid" : "pending",
    vendor: String(vendor || ""),
    notes: String(notes || ""),
    createdAt: new Date().toISOString(),
  };
  const idx = list.findIndex((x: any) => x.id === item.id);
  if (idx >= 0) {
    // preserve createdAt
    item.createdAt = list[idx].createdAt;
    list[idx] = item;
  } else list.unshift(item);
  write(list);
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req, ["super_admin", "finance"])) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = read().filter((x: any) => x.id !== id);
  write(list);
  return NextResponse.json({ ok: true });
}
