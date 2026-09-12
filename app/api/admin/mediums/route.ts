import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const list = await prisma.medium.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, active } = body;
  if (!name || !String(name).trim()) return NextResponse.json({ error: "name required" }, { status: 400 });
  const data = { name: String(name).trim(), active: active === undefined ? true : !!active };
  if (id) {
    try {
      const updated = await prisma.medium.update({ where: { id }, data });
      return NextResponse.json(updated);
    } catch (e: any) {
      if (e?.code === "P2002") return NextResponse.json({ error: "A medium with this name already exists" }, { status: 400 });
      throw e;
    }
  }
  try {
    const created = await prisma.medium.create({ data });
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "A medium with this name already exists" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.medium.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
