import { NextRequest, NextResponse } from "next/server";
import { requireStudentSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

async function cartWithItems(userId: string) {
  const cart = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  const ids: string[] = [];
  for (const c of cart) if (ids.indexOf(c.storeItemId) === -1) ids.push(c.storeItemId);
  const items = ids.length > 0 ? await prisma.storeItem.findMany({ where: { id: { in: ids } } }) : [];
  const byId: Record<string, (typeof items)[number]> = {};
  for (const i of items) byId[i.id] = i;
  const out = [];
  for (const c of cart) {
    const product = byId[c.storeItemId] || null;
    if (product) out.push({ ...c, product });
  }
  return out;
}

export async function GET(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const cart = await cartWithItems(auth.session.userId);
  return NextResponse.json(cart, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { storeItemId, qty = 1, size } = body;
  if (!storeItemId) return NextResponse.json({ error: "storeItemId required" }, { status: 400 });
  const q = Math.max(1, Math.min(99, Number(qty) || 1));

  const product = await prisma.storeItem.findUnique({ where: { id: storeItemId } });
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
  if (product.stock <= 0) return NextResponse.json({ error: "Out of stock" }, { status: 400 });
  const sizes: string[] = (product as any).sizes || [];
  if (sizes.length > 0) {
    if (!size || !sizes.includes(String(size))) {
      return NextResponse.json({ error: `Size required — available: ${sizes.join(", ")}` }, { status: 400 });
    }
  }
  if (q > product.stock) return NextResponse.json({ error: `Only ${product.stock} in stock` }, { status: 400 });

  // NOTE: empty string (not NULL) for sizeless items so the @@unique holds in Postgres
  const sizeKey = sizes.length > 0 ? String(size) : "";
  const item = await prisma.cartItem.upsert({
    where: { userId_storeItemId_size: { userId: auth.session.userId, storeItemId, size: sizeKey } },
    update: { qty: q },
    create: { userId: auth.session.userId, storeItemId, qty: q, size: sizeKey },
  });
  const cart = await cartWithItems(auth.session.userId);
  return NextResponse.json({ ok: true, item, cart });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireStudentSession(req);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (searchParams.get("clear") === "1") {
    await prisma.cartItem.deleteMany({ where: { userId: auth.session.userId } });
    return NextResponse.json({ ok: true });
  }
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const existing = await prisma.cartItem.findUnique({ where: { id } });
  if (!existing || existing.userId !== auth.session.userId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.cartItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
