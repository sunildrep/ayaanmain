import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const list = await prisma.duration.findMany({ orderBy: { months: "asc" } });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, months, active } = body;
  if (!name || !months || Number(months) <= 0) return NextResponse.json({ error: "name and months (>0) required" }, { status: 400 });
  const data = { name: String(name).trim(), months: Math.round(Number(months)), active: active === undefined ? true : !!active };
  if (id) {
    const updated = await prisma.duration.update({ where: { id }, data });
    return NextResponse.json(updated);
  }
  try {
    const created = await prisma.duration.create({ data });
    return NextResponse.json(created);
  } catch {
    return NextResponse.json({ error: "Duration name already exists" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.duration.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
