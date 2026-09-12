import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const auth = await requireAdminSession(req, ["super_admin", "finance"]);
  if (auth.error) return auth.error;
  const { searchParams } = new URL(req.url);
  const admissionId = searchParams.get("admissionId") || "";
  const studentId = searchParams.get("studentId") || "";
  const q = (searchParams.get("q") || "").toLowerCase();
  const where: any = {};
  if (admissionId) where.admissionId = admissionId;
  if (studentId) where.studentId = studentId;
  const list = await prisma.receipt.findMany({
    where,
    include: { feePayment: { include: { allocations: { include: { installment: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  const filtered = q ? list.filter((r) => r.receiptNo.toLowerCase().includes(q)) : list;
  return NextResponse.json(filtered, { headers: { "Cache-Control": "no-store" } });
}
