import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
const filePath = path.join(process.cwd(), "data", "store.json");
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
  if (!check(req)) return NextResponse.json({ error: "Forbidden: super_admin only" }, { status: 403 });
  const body = await req.json();
  const { id, name, price, category, stock, threshold, sku, image } = body;
  if (!name || price === undefined) return NextResponse.json({ error: "name and price required" }, { status: 400 });
  const list = read();
  const item = { id: id || `SKU-${Date.now()}`, name: String(name).trim(), price: Number(price), category: String(category || "General"), stock: Number(stock ?? 0), threshold: Number(threshold ?? 5), sku: String(sku || ""), image: String(image || "") };
  const idx = list.findIndex((x: any) => x.id === item.id);
  if (idx >= 0) list[idx] = { ...list[idx], ...item };
  else list.unshift(item);
  write(list);
  return NextResponse.json(item);
}
export async function PATCH(req: NextRequest) {
  if (req.cookies.get("ayaan_admin")?.value !== "1") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!check(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const { id, delta, stock } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const list = read();
  const idx = list.findIndex((x: any) => x.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stock !== undefined) list[idx].stock = Math.max(0, Number(stock));
  else if (delta !== undefined) list[idx].stock = Math.max(0, Number(list[idx].stock) + Number(delta));
  write(list);
  return NextResponse.json(list[idx]);
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
