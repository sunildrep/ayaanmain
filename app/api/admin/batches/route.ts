import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const batches = await prisma.batch.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(batches, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const body = await req.json();
  const item = await prisma.batch.upsert({
    where: { id: body.id || "" },
    update: { course: String(body.course || "SI"), medium: String(body.medium || "Telugu"), mode: String(body.mode || "Residential"), startDate: body.startDate ? new Date(body.startDate) : new Date(), seats: Number(body.seats || 60), filled: Number(body.filled || 0), duration: String(body.duration || "3 Months"), status: body.status === "closed" ? "closed" : "open", note: String(body.note || "").slice(0, 200) },
    create: { id: body.id || `BATCH-${Date.now()}`, course: String(body.course || "SI"), medium: String(body.medium || "Telugu"), mode: String(body.mode || "Residential"), startDate: body.startDate ? new Date(body.startDate) : new Date(), seats: Number(body.seats || 60), filled: Number(body.filled || 0), duration: String(body.duration || "3 Months"), status: body.status === "closed" ? "closed" : "open", note: String(body.note || "").slice(0, 200) },
  });
  return NextResponse.json(item);
}
export async function DELETE(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.batch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
