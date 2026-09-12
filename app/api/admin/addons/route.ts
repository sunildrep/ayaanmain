import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

function parseCourses(v: any): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  return String(v || "").split(",").map((s) => s.trim()).filter(Boolean);
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const list = await prisma.addon.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, fee, courses, active } = body;
  if (!name || fee === undefined) return NextResponse.json({ error: "name and fee required" }, { status: 400 });
  const data = { name: String(name).trim(), fee: Math.max(0, Math.round(Number(fee))), courses: parseCourses(courses), active: active === undefined ? true : !!active };
  if (id) {
    const updated = await prisma.addon.update({ where: { id }, data });
    return NextResponse.json(updated);
  }
  const created = await prisma.addon.create({ data });
  return NextResponse.json(created);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.addon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
