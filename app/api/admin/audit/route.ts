import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "finance"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") || "";
  const entityId = searchParams.get("entityId") || "";
  const where: any = {};
  if (entity) where.entity = entity;
  if (entityId) where.entityId = entityId;
  const list = await prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json(list, { headers: { "Cache-Control": "no-store" } });
}
