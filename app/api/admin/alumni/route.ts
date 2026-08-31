import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const alumni = await prisma.alumni.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(alumni, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const { id, name, role, batch, course, quote, video, image, featured } = body;
  if (!name || !quote) return NextResponse.json({ error: "name and quote required" }, { status: 400 });
  const item = await prisma.alumni.upsert({
    where: { id: id || "" },
    update: { name: String(name).trim(), role: String(role || ""), batch: String(batch || ""), course: String(course || "General"), quote: String(quote).trim(), video: String(video || ""), image: String(image || ""), featured: !!featured },
    create: { id: id || `ALU-${Date.now()}`, name: String(name).trim(), role: String(role || ""), batch: String(batch || ""), course: String(course || "General"), quote: String(quote).trim(), video: String(video || ""), image: String(image || ""), featured: !!featured },
  });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.alumni.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
