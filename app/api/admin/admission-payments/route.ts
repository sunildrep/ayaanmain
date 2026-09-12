import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

// Admin view of per-split payment records for an admission (or all)
export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "admissions", "finance"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const admissionId = searchParams.get("admissionId");
  const rows = await prisma.admissionPayment.findMany({
    where: admissionId ? { admissionId } : {},
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(rows, { headers: { "Cache-Control": "no-store" } });
}
