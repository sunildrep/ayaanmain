import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const items = await prisma.storeItem.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(items, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, price, category, stock, threshold, sku, image } = body;
  if (!name || price === undefined) return NextResponse.json({ error: "name and price required" }, { status: 400 });
  const item = await prisma.storeItem.upsert({
    where: { id: id || "" },
    update: { name: String(name).trim(), price: Number(price), category: String(category || "General"), stock: Number(stock ?? 0), threshold: Number(threshold ?? 5), sku: String(sku || ""), image: String(image || "") },
    create: { id: id || `SKU-${Date.now()}`, name: String(name).trim(), price: Number(price), category: String(category || "General"), stock: Number(stock ?? 0), threshold: Number(threshold ?? 5), sku: String(sku || ""), image: String(image || "") },
  });
  return NextResponse.json(item);
}
export async function PATCH(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, delta, stock } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.storeItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const newStock = stock !== undefined ? Math.max(0, Number(stock)) : Math.max(0, Number(existing.stock) + Number(delta));
  const updated = await prisma.storeItem.update({ where: { id }, data: { stock: newStock } });
  return NextResponse.json(updated);
}
export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.storeItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
